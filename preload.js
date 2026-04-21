const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    showNotification: (title, body, messenger) => {
        ipcRenderer.send('show-notification', { title, body, messenger });
    },
    updateBadge: (count) => ipcRenderer.send('update-badge', count),
    onSwitchTab: (callback) => ipcRenderer.on('switch-tab', (_event, value) => callback(value)),
    setProxy: (messenger, config) => ipcRenderer.send('set-proxy', { messenger, proxyRules: config }),
    setOpenExternalLinksEnabled: (enabled) => ipcRenderer.send('set-open-external-links-enabled', Boolean(enabled)),
    onLog: (callback) => ipcRenderer.on('log-message', (_event, message) => callback(message)),
    openExternal: (url) => ipcRenderer.send('open-external', url),
    onClearCacheRequest: (callback) => ipcRenderer.on('clear-cache-request', () => callback()),
    sendPartitionList: (partitions) => ipcRenderer.send('clear-cache-partitions', partitions),
    cleanupPartitionData: (partitionId) => ipcRenderer.invoke('cleanup-partition-data', partitionId),
    cleanupOrphanPartitions: (activePartitions) => ipcRenderer.invoke('cleanup-orphan-partitions', activePartitions)
});
