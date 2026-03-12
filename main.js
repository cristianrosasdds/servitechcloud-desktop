const { app, BrowserWindow, shell, Menu, nativeImage, Tray } = require("electron");
const path = require("path");

const APP_URL = "https://servitechapp-app.vercel.app/login";
const isDev = !app.isPackaged;

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "ServitechCloud",
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: "default",
    backgroundColor: "#ffffff",
    show: false,
  });

  // Show when ready to avoid white flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Load the web app
  mainWindow.loadURL(APP_URL);

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // Handle navigation to external URLs
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(APP_URL) && !url.startsWith("https://accounts.google.com")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App menu
function createMenu() {
  const template = [
    {
      label: "ServitechCloud",
      submenu: [
        { label: "Acerca de ServitechCloud", role: "about" },
        { type: "separator" },
        { label: "Recargar", accelerator: "CmdOrCtrl+R", click: () => mainWindow?.reload() },
        { label: "Recargar (sin caché)", accelerator: "CmdOrCtrl+Shift+R", click: () => mainWindow?.webContents.reloadIgnoringCache() },
        { type: "separator" },
        { label: "Salir", accelerator: "CmdOrCtrl+Q", role: "quit" },
      ],
    },
    {
      label: "Editar",
      submenu: [
        { label: "Deshacer", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Rehacer", accelerator: "CmdOrCtrl+Shift+Z", role: "redo" },
        { type: "separator" },
        { label: "Cortar", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copiar", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Pegar", accelerator: "CmdOrCtrl+V", role: "paste" },
        { label: "Seleccionar todo", accelerator: "CmdOrCtrl+A", role: "selectAll" },
      ],
    },
    {
      label: "Ver",
      submenu: [
        { label: "Zoom +", accelerator: "CmdOrCtrl+=", role: "zoomIn" },
        { label: "Zoom -", accelerator: "CmdOrCtrl+-", role: "zoomOut" },
        { label: "Zoom normal", accelerator: "CmdOrCtrl+0", role: "resetZoom" },
        { type: "separator" },
        { label: "Pantalla completa", accelerator: "F11", role: "togglefullscreen" },
      ],
    },
    {
      label: "Ventana",
      submenu: [
        { label: "Minimizar", accelerator: "CmdOrCtrl+M", role: "minimize" },
        { label: "Cerrar", accelerator: "CmdOrCtrl+W", role: "close" },
      ],
    },
  ];

  // Add dev tools in development
  if (isDev) {
    template[2].submenu.push(
      { type: "separator" },
      { label: "Dev Tools", accelerator: "CmdOrCtrl+Shift+I", role: "toggleDevTools" }
    );
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  createMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
