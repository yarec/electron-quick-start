const {autoUpdater, ipcRenderer, ipcMain} = require('electron');
//const ms = require('ms');

const {version} = require('./package');

// accepted values: `osx`, `win32`
// https://nuts.gitbook.com/update-windows.html
const platform = process.platform === 'darwin' ?
  'osx' :
  process.platform;
const FEED_URL = `http://114.215.168.201:5000/update/${platform}`;
let isInit = false;

function init() {
  autoUpdater.on('error', (err, msg) => {
    console.error('Error fetching updates', msg + ' (' + err.stack + ')');
  });

  autoUpdater.setFeedURL(`${FEED_URL}/${version}`);
  autoUpdater.checkForUpdates();

  isInit = true;
}

module.exports = function (win) {
  if (!isInit) {
    init();
  }

  const {rpc} = win;

  const onupdate = (ev, releaseNotes, releaseName) => {
    console.log("on update")
    ipcMain.emit('update available', {releaseNotes, releaseName});
  };

  autoUpdater.on('update-downloaded', onupdate);

  ipcMain.once('quit and install', () => {
    autoUpdater.quitAndInstall();
  });

  win.on('close', () => {
    autoUpdater.removeListener('update-downloaded', onupdate);
  });
};
