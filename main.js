const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { createMenu } = require('./menu-handler');
const { registerIpcHandlers } = require('./ipc-handlers');
const proxyManager = require('./proxy-manager');
const { createExternalLinkOpener, normalizeExternalUrl } = require('./external-link-handler');

let mainWindow;
let openExternalLinksEnabled = true;
const E2E_EXTERNAL_LINK_ARG = '--e2e-external-link';
const E2E_EXTERNAL_LINK_MARKER = 'E2E_OPEN_EXTERNAL:';
const isExternalLinkE2EMode = process.argv.includes(E2E_EXTERNAL_LINK_ARG);

function setOpenExternalLinksEnabled(enabled) {
  if (isExternalLinkE2EMode) {
    openExternalLinksEnabled = true;
    return;
  }
  openExternalLinksEnabled = Boolean(enabled);
}

function getOpenExternalLinksEnabled() {
  return openExternalLinksEnabled;
}

const openExternalLink = createExternalLinkOpener({
  dedupeWindowMs: 500,
  openExternal: (url) => {
    if (isExternalLinkE2EMode) {
      console.log(`${E2E_EXTERNAL_LINK_MARKER}${url}`);
      setTimeout(() => app.quit(), 50);
      return;
    }
    return shell.openExternal(url);
  }
});

function isValidExternalUrl(url) {
  return Boolean(normalizeExternalUrl(url));
}

function attachWindowOpenHandler(webContents) {
  if (!webContents || webContents.isDestroyed()) return;
  if (typeof webContents.setWindowOpenHandler !== 'function') return;

  webContents.setWindowOpenHandler(({ url }) => {
    if (!isValidExternalUrl(url)) {
      return { action: 'deny' };
    }

    if (!getOpenExternalLinksEnabled()) {
      return { action: 'allow' };
    }

    openExternalLink(url);
    return { action: 'deny' };
  });
}

function runExternalLinkE2EProbe() {
  const timeoutMs = 30000;
  const timeoutId = setTimeout(() => {
    console.error('E2E_EXTERNAL_LINK_TIMEOUT');
    app.exit(1);
  }, timeoutMs);

  mainWindow.webContents.once('did-finish-load', () => {
    const tryInjectProbe = () => {
      const probeScript = `
        (() => {
          localStorage.setItem('external_links_in_browser_v1', '1');
          if (typeof setExternalLinksInBrowser === 'function') {
            setExternalLinksInBrowser(true);
          }
          const webview = document.querySelector('.webview');
          if (!webview) return 'retry';

          if (webview.dataset.e2eProbeAttached === '1') return 'attached';
          webview.dataset.e2eProbeAttached = '1';

          const clickScript = \`
            (() => {
              // Deterministic probe: force a cross-host navigation so renderer's
              // will-navigate handler routes it to openExternal.
              window.location.href = 'https://example.com/';
              return true;
            })();
          \`;

          let attempts = 0;
          const maxAttempts = 40;
          const isDomReadyNotReached = (message) => message.includes('dom-ready event emitted');
          const handleProbeError = (error) => {
            const message = error && error.message ? error.message : String(error);
            if (isDomReadyNotReached(message) && attempts < maxAttempts) {
              setTimeout(clickLinkInsideWebview, 100);
              return;
            }
            console.error('E2E_EXTERNAL_LINK_WEBVIEW_SCRIPT_ERROR', message);
          };

          const clickLinkInsideWebview = () => {
            attempts += 1;
            let pendingResult;
            try {
              pendingResult = webview.executeJavaScript(clickScript);
            } catch (error) {
              handleProbeError(error);
              return;
            }

            Promise.resolve(pendingResult).then(() => {
              webview.dataset.e2eProbeDone = '1';
            }).catch(handleProbeError);
          };

          webview.addEventListener('dom-ready', () => {
            if (webview.dataset.e2eProbeDone === '1') return;
            clickLinkInsideWebview();
          }, { once: true });

          // Immediate attempt handles the case when dom-ready already happened.
          clickLinkInsideWebview();
          return 'attached';
        })();
      `;

      mainWindow.webContents.executeJavaScript(probeScript).then((status) => {
        if (status === 'retry') {
          setTimeout(tryInjectProbe, 250);
        }
      }).catch((error) => {
        console.error('E2E_EXTERNAL_LINK_RENDERER_SCRIPT_ERROR', error && error.message ? error.message : error);
        app.exit(1);
      });
    };

    tryInjectProbe();
  });

  app.once('will-quit', () => {
    clearTimeout(timeoutId);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js')
      // sandbox: true // Recommended for security, but might conflict with complex webview interactions if not careful.
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#1a1a2e'
  });

  mainWindow.loadFile('renderer/index.html');

  // Открытие DevTools в режиме разработки
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Register Menu and IPC
  createMenu(mainWindow);
  registerIpcHandlers(mainWindow, {
    openExternalLink,
    setOpenExternalLinksEnabled,
    isOpenExternalLinksEnabled: getOpenExternalLinksEnabled
  });

  attachWindowOpenHandler(mainWindow.webContents);

  mainWindow.webContents.on('did-attach-webview', (_event, webviewContents) => {
    attachWindowOpenHandler(webviewContents);
  });

  if (isExternalLinkE2EMode) {
    runExternalLinkE2EProbe();
  }
}

// Единственный экземпляр приложения
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  proxyManager.stopAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  proxyManager.stopAll();
});
