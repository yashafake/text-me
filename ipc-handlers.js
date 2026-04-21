const { ipcMain, Notification, app, session, dialog } = require('electron');
const fs = require('fs/promises');
const path = require('path');
const proxyManager = require('./proxy-manager');

let proxyCredentialsList = [];
const TRANSIENT_STORAGES = ['serviceworkers', 'cachestorage', 'shadercache', 'filesystem'];
const LEGACY_PARTITION_IDS = new Set(['telegram', 'whatsapp', 'whatsapp-business', 'instagram', 'vkontakte']);

function normalizePartitionId(value) {
    if (value === null || value === undefined) return null;
    const raw = String(value);
    if (!raw.trim()) return null;
    return raw.trim();
}

function isSafePartitionPathId(partitionId) {
    return /^[a-zA-Z0-9._-]+$/.test(partitionId);
}

function isManagedPartitionId(partitionId) {
    return partitionId.startsWith('acc_') || LEGACY_PARTITION_IDS.has(partitionId);
}

async function clearSessionCacheAndTransientStorage(ses) {
    await ses.clearCache();
    await ses.clearStorageData({
        storages: TRANSIENT_STORAGES
    });
}

async function clearPartitionData(partitionId) {
    const normalizedId = normalizePartitionId(partitionId);
    if (!normalizedId) {
        throw new Error('Invalid partition id');
    }

    const ses = session.fromPartition(`persist:${normalizedId}`);
    await ses.closeAllConnections();
    await clearSessionCacheAndTransientStorage(ses);

    // Removed account partitions can be fully wiped without affecting active sessions.
    await ses.clearStorageData();
    await ses.flushStorageData();

    return { ok: true, id: normalizedId };
}

async function removePartitionDirectoriesById(partitionId) {
    const normalizedId = normalizePartitionId(partitionId);
    if (!normalizedId || !isSafePartitionPathId(normalizedId)) {
        return { removed: [], errors: [`Unsafe partition id: ${partitionId}`] };
    }

    const partitionsDir = path.join(app.getPath('userData'), 'Partitions');
    const candidateDirs = [normalizedId, `%20${normalizedId}`];
    const removed = [];
    const errors = [];

    for (const dirName of candidateDirs) {
        const fullPath = path.join(partitionsDir, dirName);
        try {
            await fs.access(fullPath);
        } catch (err) {
            continue;
        }
        try {
            await fs.rm(fullPath, { recursive: true, force: true });
            removed.push(dirName);
        } catch (err) {
            errors.push(`${dirName}: ${err.message}`);
        }
    }

    return { removed, errors };
}

async function cleanupOrphanPartitionFolders(activePartitionIds) {
    const activeSet = new Set(
        Array.isArray(activePartitionIds)
            ? activePartitionIds
                .map(normalizePartitionId)
                .filter(Boolean)
            : []
    );

    const partitionsDir = path.join(app.getPath('userData'), 'Partitions');
    const result = { removed: [], skipped: [], errors: [] };

    let entries = [];
    try {
        entries = await fs.readdir(partitionsDir, { withFileTypes: true });
    } catch (err) {
        if (err.code === 'ENOENT') return result;
        result.errors.push(`Read Partitions dir: ${err.message}`);
        return result;
    }

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const rawName = entry.name;
        let decodedName = rawName;
        try {
            decodedName = decodeURIComponent(rawName);
        } catch (e) {
            // Keep raw name if it is not URI-encoded.
        }

        if (activeSet.has(decodedName)) {
            result.skipped.push(rawName);
            continue;
        }

        const normalized = normalizePartitionId(decodedName);
        if (!normalized || !isManagedPartitionId(normalized)) {
            result.skipped.push(rawName);
            continue;
        }

        const fullPath = path.join(partitionsDir, rawName);
        try {
            await fs.rm(fullPath, { recursive: true, force: true });
            result.removed.push(rawName);
        } catch (err) {
            result.errors.push(`${rawName}: ${err.message}`);
        }
    }

    return result;
}

function logToRenderer(mainWindow, message) {
    console.log(message);
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('log-message', message);
    }
}

function registerIpcHandlers(mainWindow, options = {}) {
    const openExternalLink = typeof options.openExternalLink === 'function'
        ? options.openExternalLink
        : () => false;
    const setOpenExternalLinksEnabled = typeof options.setOpenExternalLinksEnabled === 'function'
        ? options.setOpenExternalLinksEnabled
        : () => { };
    const isOpenExternalLinksEnabled = typeof options.isOpenExternalLinksEnabled === 'function'
        ? options.isOpenExternalLinksEnabled
        : () => true;

    // IPC для уведомлений
    ipcMain.on('show-notification', (event, { title, body, messenger }) => {
        const notification = new Notification({
            title: title,
            body: body,
            silent: false
        });

        notification.on('click', () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.show();
                mainWindow.webContents.send('switch-tab', messenger);
            }
        });

        notification.show();
    });

    // Open external links in system browser
    ipcMain.on('open-external', (_event, url) => {
        if (!isOpenExternalLinksEnabled()) return;
        openExternalLink(url);
    });

    ipcMain.on('set-open-external-links-enabled', (_event, enabled) => {
        setOpenExternalLinksEnabled(enabled);
    });

    // IPC для обновления badge на Dock иконке
    ipcMain.on('update-badge', (event, count) => {
        if (process.platform === 'darwin') {
            app.dock.setBadge(count > 0 ? String(count) : '');
        }
    });

    // IPC для установки прокси
    ipcMain.on('set-proxy', async (event, { messenger, proxyRules }) => {
        let rules = proxyRules;
        let credentials = null;

        if (typeof proxyRules === 'object' && proxyRules !== null && proxyRules.rules) {
            rules = proxyRules.rules;
            credentials = proxyRules.credentials;
        }

        const partition = `persist:${messenger}`;
        const ses = require('electron').session.fromPartition(partition);

        try {
            let finalRules = rules ? rules.trim() : "";
            let localPort = null;

            // Check for advanced protocols (vless, ss, trojan)
            if (finalRules.startsWith('vless://') || finalRules.startsWith('ss://') || finalRules.startsWith('trojan://')) {
                logToRenderer(mainWindow, `Detected advanced protocol: ${finalRules.split('://')[0]}. Starting sing-box...`);
                try {
                    localPort = await proxyManager.start(messenger, finalRules);
                    // Now we use the local SOCKS5 port
                    finalRules = `socks5://127.0.0.1:${localPort}`;
                    logToRenderer(mainWindow, `Local proxy started on port ${localPort}`);
                } catch (e) {
                    logToRenderer(mainWindow, `Error starting local proxy: ${e.message}`);
                    return;
                }
            } else {
                // If it's a standard proxy, stop any running local proxy for this messenger
                proxyManager.stop(messenger);

                // Standard logic for credentials
                if (rules && credentials) {
                    let hostPort = rules;
                    if (hostPort.includes('://')) hostPort = hostPort.split('://')[1];
                    if (hostPort.includes('/')) hostPort = hostPort.split('/')[0];
                    hostPort = hostPort.trim();

                    const [host, port] = hostPort.split(':');

                    // Удаляем старую запись
                    proxyCredentialsList = proxyCredentialsList.filter(c => !(c.host === host && String(c.port) === String(port)));

                    // Добавляем новую
                    proxyCredentialsList.push({
                        host,
                        port: port || (rules.startsWith('http') ? '80' : '1080'),
                        username: credentials.username,
                        password: credentials.password
                    });

                    logToRenderer(mainWindow, `Credentials updated for ${host}:${port}`);
                }
            }

            // PAC script generation logic
            let config = { proxyRules: "direct://" };

            if (finalRules) {
                if (finalRules.startsWith('socks5://')) {
                    const address = finalRules.replace('socks5://', '');
                    const pacScript = `
                  function FindProxyForURL(url, host) {
                      return "SOCKS5 ${address}; DIRECT";
                  }
              `;
                    const pacUrl = `data:application/x-ns-proxy-autoconfig;base64,${Buffer.from(pacScript).toString('base64')}`;
                    config = { pacScript: pacUrl };
                    logToRenderer(mainWindow, `Using PAC script for ${finalRules}`);
                } else {
                    config = { proxyRules: finalRules };
                }
            }

            await ses.closeAllConnections();
            await ses.setProxy(config);
            logToRenderer(mainWindow, `Proxy config set for ${messenger}`);

        } catch (err) {
            console.error(`Failed to set proxy for ${messenger}:`, err);
            logToRenderer(mainWindow, `Error setting proxy: ${err.message}`);
        }
    });

    ipcMain.removeHandler('cleanup-partition-data');
    ipcMain.handle('cleanup-partition-data', async (_event, partitionId) => {
        try {
            await clearPartitionData(partitionId);
            const dirResult = await removePartitionDirectoriesById(partitionId);
            return {
                ok: dirResult.errors.length === 0,
                removedDirs: dirResult.removed,
                errors: dirResult.errors
            };
        } catch (err) {
            return {
                ok: false,
                removedDirs: [],
                errors: [err.message]
            };
        }
    });

    ipcMain.removeHandler('cleanup-orphan-partitions');
    ipcMain.handle('cleanup-orphan-partitions', async (_event, activePartitionIds) => {
        const result = await cleanupOrphanPartitionFolders(activePartitionIds);
        return {
            ok: result.errors.length === 0,
            removed: result.removed,
            skipped: result.skipped,
            errors: result.errors
        };
    });

    // IPC для очистки кэша
    ipcMain.on('clear-cache-partitions', async (event, partitionIds) => {
        logToRenderer(mainWindow, 'Starting cache cleanup...');
        let clearedCount = 0;
        let errors = [];

        // 1. Clear default session cache + transient web storage
        try {
            await clearSessionCacheAndTransientStorage(session.defaultSession);
            clearedCount++;
            logToRenderer(mainWindow, 'Default session cache and transient storage cleared.');
        } catch (e) {
            errors.push(`Default session: ${e.message}`);
        }

        // 2. Clear active partition sessions cache + transient storage
        if (Array.isArray(partitionIds)) {
            for (const id of partitionIds) {
                try {
                    const normalizedId = normalizePartitionId(id);
                    if (!normalizedId) continue;
                    const partitionName = `persist:${normalizedId}`;
                    const ses = session.fromPartition(partitionName);
                    await clearSessionCacheAndTransientStorage(ses);
                    clearedCount++;
                    logToRenderer(mainWindow, `Cache and transient storage cleared for partition: ${normalizedId}`);
                } catch (e) {
                    errors.push(`Partition ${id}: ${e.message}`);
                }
            }
        }

        // 3. Remove stale partition folders left by deleted accounts
        const orphanCleanupResult = await cleanupOrphanPartitionFolders(partitionIds);
        const removedOrphansCount = orphanCleanupResult.removed.length;
        if (removedOrphansCount > 0) {
            logToRenderer(mainWindow, `Removed orphan partition folders: ${removedOrphansCount}`);
        }
        if (orphanCleanupResult.errors.length > 0) {
            errors = errors.concat(orphanCleanupResult.errors.map((msg) => `Orphan cleanup ${msg}`));
        }

        // Show result dialog
        const message = errors.length > 0
            ? `Очистка завершена с ошибками:\n${errors.join('\n')}`
            : `Очистка завершена (${clearedCount} сессий). Удалено устаревших разделов: ${removedOrphansCount}.`;

        dialog.showMessageBox(mainWindow, {
            type: errors.length > 0 ? 'warning' : 'info',
            title: 'Очистка кэша',
            message: message,
            buttons: ['OK']
        });
    });

    // Handle Proxy Login
    app.on('login', (event, webContents, request, authInfo, callback) => {
        if (authInfo.isProxy) {
            // Find credentials
            let creds = proxyCredentialsList.find(c => c.host === authInfo.host && String(c.port) === String(authInfo.port));

            // Fuzzy match
            if (!creds) {
                creds = proxyCredentialsList.find(c => c.host === authInfo.host);
            }

            if (creds) {
                event.preventDefault();
                // logToRenderer(mainWindow, `Sending credentials for ${authInfo.host}`); // Optional: reduce noise
                callback(creds.username, creds.password);
            }
        }
    });
}

module.exports = { registerIpcHandlers };
