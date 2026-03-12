// Preload script - runs before web content loads
// Provides a secure bridge between renderer and main process if needed

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  isElectron: true,
});
