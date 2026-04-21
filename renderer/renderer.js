const tabsContainer = document.getElementById('tabs');
const webviewContainer = document.getElementById('webview-container');
const settingsBtn = document.getElementById('settings-btn');
const addAccountBtn = document.getElementById('add-account-btn');

const settingsModal = document.getElementById('settings-modal');
const closeModal = document.getElementById('close-modal');
const cancelSettings = document.getElementById('cancel-settings');
const saveSettings = document.getElementById('save-settings');

const addAccountModal = document.getElementById('add-account-modal');
const closeAddModal = document.getElementById('close-add-modal');
const cancelAdd = document.getElementById('cancel-add');
const createAccountBtn = document.getElementById('create-account');
const accountTypeSelect = document.getElementById('account-type-select');
const accountNameInput = document.getElementById('account-name-input');

const proxyAccountSelect = document.getElementById('proxy-account-select');
const proxyProto = document.getElementById('proxy-proto');
const proxySocksFields = document.getElementById('proxy-socks-fields');
const proxySsFields = document.getElementById('proxy-ss-fields');
const proxyUrl = document.getElementById('proxy-url');
const proxyUser = document.getElementById('proxy-user');
const proxyPass = document.getElementById('proxy-pass');
const ssHost = document.getElementById('ss-host');
const ssPort = document.getElementById('ss-port');
const ssMethod = document.getElementById('ss-method');
const ssPass = document.getElementById('ss-pass');
const openExternalLinksCheckbox = document.getElementById('open-external-links-checkbox');

const UA_CHROME_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const ACCOUNT_TYPES = {
    telegram: {
        label: 'Telegram',
        url: 'https://web.telegram.org/k/',
        icon: `
      <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
      </svg>
    `,
        allowedHosts: ['web.telegram.org']
    },
    whatsapp: {
        label: 'WhatsApp',
        url: 'https://web.whatsapp.com/',
        userAgent: UA_CHROME_MAC,
        icon: `
      <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    `,
        allowedHosts: ['web.whatsapp.com']
    },
    'whatsapp-business': {
        label: 'WhatsApp Business',
        url: 'https://web.whatsapp.com/',
        userAgent: UA_CHROME_MAC,
        icon: `
      <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    `,
        allowedHosts: ['web.whatsapp.com']
    },
    instagram: {
        label: 'Instagram',
        url: 'https://instagram.com/',
        userAgent: UA_CHROME_MAC,
        icon: `
      <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM17.5 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
      </svg>
    `,
        allowedHosts: ['instagram.com', 'www.instagram.com']
    },
    vkontakte: {
        label: 'VKontakte',
        url: 'https://vk.com/',
        userAgent: UA_CHROME_MAC,
        icon: `
      <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.07 2H8.93C3.596 2 2 3.596 2 8.93v6.14C2 20.404 3.596 22 8.93 22h6.14c5.334 0 6.93-1.596 6.93-6.93V8.93C22 3.596 20.404 2 15.07 2zM17.6 13.9c.72 2.65-2.08 3.08-2.08 3.08h-1.5c-4.22.45-6.84-2.84-7-5.6-.17-3.69 2.59-4.7 3.23-4.7h1.4c.16 0 .54.12.54.51-.01.3-.23.67-.5.98-.32.36-.67.75-1.07 1.25-.97 1.22-.05 2.12.87 2.12h.16c1.62 0 .53-3.64 2.12-3.64h.47c1.7 0 .84.86.84 2.84 0 .33-.06.74.3 1.05.15.12.5.15.75-.12 1.34-1.46 1.7-2.6 1.7-2.6.22-1.01 1.79-1.12 1.79-1.12h1.6s.51-.03.77.3c.27.32.22.84-.01 1.23-.05.07-.38.74-2 2.52-.39.42-.51.64 0 1.29.38.48 1.68 2.37 2.67 3.32.74.72.6.94.6.94h-1.4c-.6-.05-1.04-.33-1.22-.54-.37-.43-.88-1.04-1.17-1.39-.42-.5-.61-.7-1.14-.54z" />
      </svg>
    `,
        allowedHosts: ['vk.com', 'www.vk.com']
    }
};

const ACCOUNTS_KEY = 'accounts_v1';
const ACTIVE_KEY = 'active_account_id';
const EXTERNAL_LINKS_IN_BROWSER_KEY = 'external_links_in_browser_v1';

let accounts = [];
let activeAccountId = null;
const unreadCounts = {};
let openExternalLinksInBrowser = true;

function generateId() {
    return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function defaultName(type) {
    const base = ACCOUNT_TYPES[type]?.label || 'Аккаунт';
    const sameType = accounts.filter(a => a.type === type).length;
    return sameType === 0 ? base : `${base} ${sameType + 1}`;
}

function saveAccounts() {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    if (activeAccountId) localStorage.setItem(ACTIVE_KEY, activeAccountId);
}

function loadExternalLinksPreference() {
    const stored = localStorage.getItem(EXTERNAL_LINKS_IN_BROWSER_KEY);
    if (stored === null) {
        setExternalLinksInBrowser(true);
        return;
    }

    const enabled = stored === '1';
    setExternalLinksInBrowser(enabled, false);
}

function setExternalLinksInBrowser(enabled, persist = true) {
    openExternalLinksInBrowser = Boolean(enabled);

    if (persist) {
        localStorage.setItem(EXTERNAL_LINKS_IN_BROWSER_KEY, openExternalLinksInBrowser ? '1' : '0');
    }

    if (openExternalLinksCheckbox) {
        openExternalLinksCheckbox.checked = openExternalLinksInBrowser;
    }

    if (window.electronAPI?.setOpenExternalLinksEnabled) {
        window.electronAPI.setOpenExternalLinksEnabled(openExternalLinksInBrowser);
    }
}

function loadAccounts() {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                accounts = parsed;
                return;
            }
        } catch (e) {
            console.warn('Failed to parse accounts:', e);
        }
    }

    accounts = [
        { id: generateId(), type: 'telegram', name: 'Telegram', proxy: null },
        { id: generateId(), type: 'whatsapp', name: 'WhatsApp', proxy: null },
        { id: generateId(), type: 'instagram', name: 'Instagram', proxy: null }
    ];

    migrateLegacyProxy(accounts.find(a => a.type === 'telegram'), 'tg', 'telegram');
    migrateLegacyProxy(accounts.find(a => a.type === 'whatsapp'), 'wa', 'whatsapp');
    migrateLegacyProxy(accounts.find(a => a.type === 'instagram'), 'ig', 'instagram');
    saveAccounts();
}

function ensureActiveAccount() {
    const stored = localStorage.getItem(ACTIVE_KEY);
    const exists = stored && accounts.find(a => a.id === stored);
    activeAccountId = exists ? stored : accounts[0]?.id;
}

function buildSSLink(host, port, method, password) {
    if (!host || !port || !method || !password) return null;
    const userPart = `${method}:${password}`;
    return `ss://${userPart}@${host}:${port}`;
}

function migrateLegacyProxy(account, prefix, messengerName) {
    if (!account) return;
    const proto = localStorage.getItem(`${prefix}_proto`) || 'socks5';
    if (proto === 'socks5') {
        const url = localStorage.getItem(`proxy_${messengerName}`) || '';
        const user = localStorage.getItem(`proxy_${messengerName}_user`) || '';
        const pass = localStorage.getItem(`proxy_${messengerName}_pass`) || '';
        if (url) {
            account.proxy = { proto, url, user, pass };
        }
    } else if (proto === 'ss') {
        const host = localStorage.getItem(`${prefix}_ss_host`) || '';
        const port = localStorage.getItem(`${prefix}_ss_port`) || '';
        const method = localStorage.getItem(`${prefix}_ss_method`) || 'aes-256-gcm';
        const pass = localStorage.getItem(`${prefix}_ss_pass`) || '';
        const link = buildSSLink(host, port, method, pass);
        if (link) {
            account.proxy = { proto, url: link, ss: { host, port, method, pass } };
        }
    }
}

function isExternalUrl(url, allowedHosts) {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        // Protocol check: only http and https are considered "web" navigation that we might want to allow or block.
        // about:blank, data:, etc. are considered internal/safe in this context.
        if (['about:', 'data:', 'blob:', 'file:'].includes(parsed.protocol)) return false;
        if (!['http:', 'https:'].includes(parsed.protocol)) return true; // Block unknown protocols

        const host = parsed.hostname;
        // Check if the host is in the allowed list
        // We check for exact match or subdomain match (e.g. valid 'telegram.org' allows 'web.telegram.org')
        const isAllowed = allowedHosts.some(allowed => {
            return host === allowed || host.endsWith(`.${allowed}`);
        });

        return !isAllowed;
    } catch (e) {
        console.warn('Invalid URL encountered:', url);
        return true; // Treat invalid URLs as external/blocked for safety
    }
}

function reloadWebview(accountId) {
    const webview = document.getElementById(`webview-${accountId}`);
    if (webview) webview.reload();
}

async function removeAccount(accountId) {
    if (accounts.length <= 1) return;
    const index = accounts.findIndex(a => a.id === accountId);
    if (index === -1) return;

    const account = accounts[index];
    const confirmed = window.confirm(`Удалить аккаунт \"${account.name || ACCOUNT_TYPES[account.type]?.label || 'Аккаунт'}\"?`);
    if (!confirmed) return;

    const webview = document.getElementById(`webview-${accountId}`);
    if (webview) webview.remove();
    const tab = document.querySelector(`.tab[data-account-id=\"${accountId}\"]`);
    if (tab) tab.remove();

    accounts.splice(index, 1);
    delete unreadCounts[accountId];

    if (activeAccountId === accountId) {
        const next = accounts[index] || accounts[index - 1] || accounts[0];
        activeAccountId = next ? next.id : null;
        if (activeAccountId) switchTab(activeAccountId);
    }

    saveAccounts();
    refreshAccountSelect();

    if (window.electronAPI?.cleanupPartitionData) {
        try {
            const cleanupResult = await window.electronAPI.cleanupPartitionData(accountId);
            if (!cleanupResult?.ok) {
                console.warn(`Partition cleanup failed for ${accountId}:`, cleanupResult?.errors || 'unknown error');
            }
        } catch (error) {
            console.warn(`Partition cleanup threw for ${accountId}:`, error);
        }
    }
}

function switchTab(accountId) {
    activeAccountId = accountId;
    saveAccounts();

    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.accountId === accountId);
    });

    document.querySelectorAll('.webview').forEach(webview => {
        webview.classList.toggle('active', webview.id === `webview-${accountId}`);
    });
}

function updateBadge(accountId, count) {
    const badge = document.querySelector(`.tab[data-account-id="${accountId}"] .badge`);
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.classList.add('visible');
        } else {
            badge.classList.remove('visible');
        }
    }

    unreadCounts[accountId] = count;
    const totalCount = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
    if (window.electronAPI) window.electronAPI.updateBadge(totalCount);
}

function parseUnreadCount(title) {
    const match = title.match(/^\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
}

function applyProxy(account) {
    if (!window.electronAPI) return;
    if (!account.proxy || !account.proxy.url) {
        window.electronAPI.setProxy(account.id, null);
        return;
    }

    window.electronAPI.setProxy(account.id, {
        rules: account.proxy.url,
        credentials: account.proxy.user ? { username: account.proxy.user, password: account.proxy.pass } : null
    });
}

function openExternalUrl(url) {
    if (!window.electronAPI) return;
    if (typeof url !== 'string') return;
    const safeUrl = url.trim();
    if (!safeUrl) return;
    window.electronAPI.openExternal(safeUrl);
}

function setupWebview(webview, account) {
    webview.addEventListener('page-title-updated', (event) => {
        const count = parseUnreadCount(event.title);
        updateBadge(account.id, count);
    });

    webview.addEventListener('will-navigate', (event) => {
        if (!openExternalLinksInBrowser) return;
        const allowed = ACCOUNT_TYPES[account.type]?.allowedHosts || [];
        if (isExternalUrl(event.url, allowed)) {
            event.preventDefault();
            openExternalUrl(event.url);
        }
    });

    webview.addEventListener('dom-ready', () => {
        webview.executeJavaScript(`
      (function() {
        const OriginalNotification = window.Notification;
        window.Notification = function(title, options) {
          window.postMessage({
            type: 'notification',
            title: title,
            body: options ? options.body : '',
            messenger: '${account.id}'
          }, '*');
          return new OriginalNotification(title, options);
        };
        window.Notification.permission = OriginalNotification.permission;
        window.Notification.requestPermission = OriginalNotification.requestPermission.bind(OriginalNotification);
      })();
    `);
    });

    webview.addEventListener('ipc-message', (event) => {
        if (event.channel === 'notification' && window.electronAPI) {
            const { title, body, messenger } = event.args[0];
            window.electronAPI.showNotification(title, body, messenger);
        }
    });

    webview.addEventListener('did-fail-load', (e) => {
        console.error(`[${account.id}] Load Failed: ${e.errorCode} (${e.errorDescription}) validatedURL: ${e.validatedURL}`);
    });
}

function createTabElement(account) {
    const tab = document.createElement('button');
    tab.className = 'tab';
    tab.dataset.accountId = account.id;
    tab.dataset.tab = account.type;
    tab.innerHTML = `
    ${ACCOUNT_TYPES[account.type]?.icon || ''}
    <span class="tab-label"></span>
    <input class="tab-label-input" type="text" />
    <span class="badge"></span>
    <span class="tab-actions-inline">
      <span class="tab-reload" title="Обновить" role="button">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
        </svg>
      </span>
      <span class="tab-delete" title="Удалить" role="button">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z" />
        </svg>
      </span>
    </span>
  `;

    const label = tab.querySelector('.tab-label');
    const input = tab.querySelector('.tab-label-input');
    label.textContent = account.name || ACCOUNT_TYPES[account.type]?.label || 'Аккаунт';

    tab.addEventListener('click', () => switchTab(account.id));

    const startEdit = () => {
        label.classList.add('editing');
        input.classList.add('active');
        input.value = account.name || '';
        input.focus();
        input.select();
    };

    const finishEdit = (commit) => {
        if (commit) {
            const nextName = input.value.trim();
            if (nextName) {
                account.name = nextName;
                label.textContent = nextName;
                saveAccounts();
                refreshAccountSelect();
            } else {
                label.textContent = account.name || ACCOUNT_TYPES[account.type]?.label || 'Аккаунт';
            }
        }
        input.classList.remove('active');
        label.classList.remove('editing');
    };

    label.addEventListener('dblclick', (event) => {
        event.preventDefault();
        event.stopPropagation();
        startEdit();
    });

    input.addEventListener('click', (event) => event.stopPropagation());
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') finishEdit(true);
        if (event.key === 'Escape') finishEdit(false);
    });
    input.addEventListener('blur', () => finishEdit(true));

    const reloadBtn = tab.querySelector('.tab-reload');
    reloadBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        reloadWebview(account.id);
    });

    const deleteBtn = tab.querySelector('.tab-delete');
    deleteBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        removeAccount(account.id);
    });

    return tab;
}

function createWebviewElement(account) {
    const webview = document.createElement('webview');
    webview.id = `webview-${account.id}`;
    webview.className = 'webview';
    webview.src = ACCOUNT_TYPES[account.type]?.url || 'about:blank';
    webview.partition = `persist:${account.id}`;

    // Security: Explicitly disable node integration and enable context isolation (though contextIsolation is not a direct attribute of webview, nodeintegration is)
    webview.setAttribute('nodeintegration', 'off');
    webview.setAttribute('allowpopups', ''); // Kept as requested, but ideally should be restricted

    if (ACCOUNT_TYPES[account.type]?.userAgent) {
        webview.useragent = ACCOUNT_TYPES[account.type].userAgent;
    }

    setupWebview(webview, account);
    return webview;
}

function renderAccounts() {
    tabsContainer.innerHTML = '';
    webviewContainer.innerHTML = '';

    accounts.forEach(account => {
        unreadCounts[account.id] = unreadCounts[account.id] || 0;
        const tab = createTabElement(account);
        const webview = createWebviewElement(account);
        tabsContainer.appendChild(tab);
        webviewContainer.appendChild(webview);
    });

    if (activeAccountId) switchTab(activeAccountId);
}

function addAccount(type, nameOverride) {
    const account = {
        id: generateId(),
        type,
        name: nameOverride?.trim() || defaultName(type),
        proxy: null
    };

    accounts.push(account);
    saveAccounts();

    const tab = createTabElement(account);
    const webview = createWebviewElement(account);
    tabsContainer.appendChild(tab);
    webviewContainer.appendChild(webview);

    switchTab(account.id);
    refreshAccountSelect();
}

function refreshAccountSelect() {
    proxyAccountSelect.innerHTML = '';
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = account.name || ACCOUNT_TYPES[account.type]?.label || 'Аккаунт';
        proxyAccountSelect.appendChild(option);
    });
}

function loadProxyForm(account) {
    const proxy = account.proxy || { proto: 'socks5' };
    proxyProto.value = proxy.proto || 'socks5';

    if (proxyProto.value === 'socks5') {
        proxySocksFields.classList.remove('hidden');
        proxySsFields.classList.add('hidden');
        proxyUrl.value = proxy.url || '';
        proxyUser.value = proxy.user || '';
        proxyPass.value = proxy.pass || '';
        handleInputProtocol(proxyUrl, proxyUrl.parentElement.querySelector('.credentials-group'));
    } else {
        proxySocksFields.classList.add('hidden');
        proxySsFields.classList.remove('hidden');
        ssHost.value = proxy.ss?.host || '';
        ssPort.value = proxy.ss?.port || '';
        ssMethod.value = proxy.ss?.method || 'aes-256-gcm';
        ssPass.value = proxy.ss?.pass || '';
    }
}

function saveProxyForm(account) {
    const proto = proxyProto.value;

    if (proto === 'socks5') {
        const url = proxyUrl.value.trim();
        const user = proxyUser.value.trim();
        const pass = proxyPass.value.trim();
        account.proxy = url ? { proto, url, user, pass } : null;
    } else {
        const host = ssHost.value.trim();
        const port = ssPort.value.trim();
        const method = ssMethod.value;
        const pass = ssPass.value.trim();
        const link = buildSSLink(host, port, method, pass);
        account.proxy = link ? { proto, url: link, ss: { host, port, method, pass } } : null;
    }

    saveAccounts();
    applyProxy(account);
}

function toggleProxyFields() {
    if (proxyProto.value === 'ss') {
        proxySocksFields.classList.add('hidden');
        proxySsFields.classList.remove('hidden');
    } else {
        proxySocksFields.classList.remove('hidden');
        proxySsFields.classList.add('hidden');
    }
}

function handleInputProtocol(inputElement, credentialsGroup) {
    if (!inputElement || !credentialsGroup) return;
    const value = inputElement.value.trim().toLowerCase();
    const isAdvanced = value.startsWith('vless://') ||
        value.startsWith('ss://') ||
        value.startsWith('trojan://') ||
        value.startsWith('vmess://');

    if (isAdvanced) {
        credentialsGroup.classList.add('hidden');
    } else {
        credentialsGroup.classList.remove('hidden');
    }
}

function openSettings() {
    refreshAccountSelect();
    const preferred = activeAccountId || accounts[0]?.id;
    const selectedId = accounts.find(a => a.id === preferred) ? preferred : proxyAccountSelect.value || accounts[0]?.id;
    proxyAccountSelect.value = selectedId;
    const account = accounts.find(a => a.id === selectedId);
    if (account) loadProxyForm(account);
    if (openExternalLinksCheckbox) {
        openExternalLinksCheckbox.checked = openExternalLinksInBrowser;
    }
    settingsModal.classList.add('active');
}

function closeSettings() {
    settingsModal.classList.remove('active');
}

function openAddAccount() {
    accountTypeSelect.value = 'telegram';
    accountNameInput.value = '';
    addAccountModal.classList.add('active');
}

function closeAddAccount() {
    addAccountModal.classList.remove('active');
}

proxyProto.addEventListener('change', toggleProxyFields);
proxyAccountSelect.addEventListener('change', () => {
    const account = accounts.find(a => a.id === proxyAccountSelect.value);
    if (account) loadProxyForm(account);
});

if (proxyUrl) {
    const creds = proxyUrl.parentElement.querySelector('.credentials-group');
    proxyUrl.addEventListener('input', () => handleInputProtocol(proxyUrl, creds));
}

settingsBtn.addEventListener('click', openSettings);
closeModal.addEventListener('click', closeSettings);
cancelSettings.addEventListener('click', closeSettings);
settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettings(); });

saveSettings.addEventListener('click', () => {
    const account = accounts.find(a => a.id === proxyAccountSelect.value);
    if (account) saveProxyForm(account);
    if (openExternalLinksCheckbox) {
        setExternalLinksInBrowser(openExternalLinksCheckbox.checked);
    }
    closeSettings();
});

addAccountBtn.addEventListener('click', openAddAccount);
closeAddModal.addEventListener('click', closeAddAccount);
cancelAdd.addEventListener('click', closeAddAccount);
addAccountModal.addEventListener('click', (e) => { if (e.target === addAccountModal) closeAddAccount(); });

createAccountBtn.addEventListener('click', () => {
    const type = accountTypeSelect.value;
    const rawName = accountNameInput.value;
    // Basic sanitization: remove HTML tags
    const sanitizedName = rawName.replace(/<[^>]*>?/gm, '');
    addAccount(type, sanitizedName);
    closeAddAccount();
});

if (window.electronAPI) {
    window.electronAPI.onSwitchTab((value) => {
        const direct = accounts.find(a => a.id === value);
        if (direct) return switchTab(direct.id);
        const byType = accounts.find(a => a.type === value);
        if (byType) return switchTab(byType.id);
    });

    window.electronAPI.onClearCacheRequest(() => {
        const partitionIds = accounts.map(a => a.id);
        window.electronAPI.sendPartitionList(partitionIds);
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    loadExternalLinksPreference();
    loadAccounts();
    ensureActiveAccount();

    if (window.electronAPI?.cleanupOrphanPartitions) {
        try {
            await window.electronAPI.cleanupOrphanPartitions(accounts.map(a => a.id));
        } catch (error) {
            console.warn('Orphan partition cleanup failed:', error);
        }
    }

    renderAccounts();
    accounts.forEach(account => {
        if (account.proxy && account.proxy.url) applyProxy(account);
    });
});

console.log('TextMe renderer initialized');
