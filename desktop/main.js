// NaruArena : launcher (mise à jour automatique depuis les versions GitHub) puis fenêtre de jeu
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let launcher = null, game = null;
const gameDir = () => app.isPackaged ? path.join(process.resourcesPath, 'game') : path.join(__dirname, '..');
const send = (ch, data) => { if (launcher && !launcher.isDestroyed()) launcher.webContents.send(ch, data); };

function openLauncher() {
  launcher = new BrowserWindow({ width: 900, height: 560, resizable: false, frame: true, autoHideMenuBar: true, backgroundColor: '#140c08', title: 'NaruArena',
    icon: path.join(__dirname, 'icon.png'), webPreferences: { preload: path.join(__dirname, 'preload.js') } });
  launcher.loadFile(path.join(__dirname, 'launcher.html'));
  launcher.webContents.on('did-finish-load', () => { send('version', app.getVersion()); checkUpdates(); });
}

// écouteurs posés une seule fois ; une recherche à la fois (au démarrage, puis à la demande avec le bouton du launcher)
let busy = false, ready = null, hooked = false;
function checkUpdates() {
  if (!app.isPackaged) { send('status', { state: 'ready', text: 'Version de développement : pas de mise à jour à chercher' }); return; }
  if (ready) { send('status', { state: 'install', text: `Version ${ready} prête : redémarre pour l'installer` }); return; }
  if (busy) return;
  busy = true;
  if (!hooked) { hooked = true; hookUpdater(); }
  send('status', { state: 'busy', text: 'Recherche de mise à jour…' });
  autoUpdater.checkForUpdates().catch(() => { busy = false; send('status', { state: 'ready', text: 'Mise à jour impossible (hors ligne ?) — tu peux jouer quand même' }); });
}
function hookUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.on('checking-for-update', () => send('status', { state: 'busy', text: 'Recherche de mise à jour…' }));
  autoUpdater.on('update-available', i => send('status', { state: 'busy', text: `Nouvelle version ${i.version} : téléchargement…` }));
  autoUpdater.on('download-progress', p => send('status', { state: 'busy', text: `Téléchargement… ${Math.round(p.percent)} %`, pct: p.percent }));
  autoUpdater.on('update-downloaded', i => { busy = false; ready = i.version; send('status', { state: 'install', text: `Version ${i.version} prête : redémarre pour l'installer` }); });
  autoUpdater.on('update-not-available', () => { busy = false; send('status', { state: 'ready', text: `Le jeu est à jour (version ${app.getVersion()})` }); });
  autoUpdater.on('error', () => { busy = false; send('status', { state: 'ready', text: 'Mise à jour impossible (hors ligne ?) — tu peux jouer quand même' }); });
}

function openGame(which) {
  if (game && !game.isDestroyed()) { game.focus(); return; }
  game = new BrowserWindow({ width: 1280, height: 760, autoHideMenuBar: true, backgroundColor: '#04050b', title: 'NaruArena', icon: path.join(__dirname, 'icon.png') });
  game.maximize();
  const file = which === 'starwars' ? 'starwars/index.html' : 'naruto/index.html';
  game.loadFile(path.join(gameDir(), file));
  game.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  // F11 : plein écran
  game.webContents.on('before-input-event', (e, inp) => { if (inp.type === 'keyDown' && inp.key === 'F11') game.setFullScreen(!game.isFullScreen()); });
  game.on('closed', () => { game = null; if (launcher && !launcher.isDestroyed()) launcher.show(); });
  if (launcher) launcher.hide();
}

ipcMain.on('play', (e, which) => openGame(which));
ipcMain.on('install', () => autoUpdater.quitAndInstall());
ipcMain.on('check', () => checkUpdates());
app.whenReady().then(openLauncher);
app.on('window-all-closed', () => app.quit());
