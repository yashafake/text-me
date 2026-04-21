const { app, Menu, BrowserWindow } = require('electron');

function createMenu(mainWindow) {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about', label: 'О TextMe' },
        { type: 'separator' },
        { role: 'services', label: 'Службы' },
        { type: 'separator' },
        { role: 'hide', label: 'Скрыть TextMe' },
        { role: 'hideOthers', label: 'Скрыть остальные' },
        { role: 'unhide', label: 'Показать все' },
        { type: 'separator' },
        { role: 'quit', label: 'Выйти из TextMe' }
      ]
    },
    {
      label: 'Редактирование',
      submenu: [
        { role: 'undo', label: 'Отменить' },
        { role: 'redo', label: 'Повторить' },
        { type: 'separator' },
        { role: 'cut', label: 'Вырезать' },
        { role: 'copy', label: 'Копировать' },
        { role: 'paste', label: 'Вставить' },
        { role: 'selectAll', label: 'Выделить всё' }
      ]
    },
    {
      label: 'Вид',
      submenu: [
        { role: 'reload', label: 'Перезагрузить' },
        { role: 'toggleDevTools', label: 'Инструменты разработчика' },
        { type: 'separator' },
        {
          label: 'Очистить кэш',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('clear-cache-request');
            }
          }
        },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Обычный размер' },
        { role: 'zoomIn', label: 'Увеличить' },
        { role: 'zoomOut', label: 'Уменьшить' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Полноэкранный режим' }
      ]
    },
    {
      label: 'Вкладки',
      submenu: [
        {
          label: 'Telegram',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('switch-tab', 'telegram');
            }
          }
        },
        {
          label: 'WhatsApp',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('switch-tab', 'whatsapp');
            }
          }
        },
        {
          label: 'WhatsApp Business',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('switch-tab', 'whatsapp-business');
            }
          }
        },
        {
          label: 'Instagram',
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('switch-tab', 'instagram');
            }
          }
        },
        {
          label: 'VKontakte',
          accelerator: 'CmdOrCtrl+5',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('switch-tab', 'vkontakte');
            }
          }
        }
      ]
    },
    {
      label: 'Окно',
      submenu: [
        { role: 'minimize', label: 'Свернуть' },
        { role: 'zoom', label: 'Масштабировать' },
        { type: 'separator' },
        { role: 'front', label: 'Все окна на передний план' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createMenu };
