const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('launcher', {
  play: which => ipcRenderer.send('play', which),
  install: () => ipcRenderer.send('install'),
  on: (ch, fn) => ipcRenderer.on(ch, (e, d) => fn(d)),
});
