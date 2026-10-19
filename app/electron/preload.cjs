// The only bridge between the web page and the desktop app.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  permissionStatus: () => ipcRenderer.invoke('permissions:status'),
  askCamera: () => ipcRenderer.invoke('permissions:ask-camera'),
  startLockdown: () => ipcRenderer.invoke('lockdown:start'),
  stopLockdown: () => ipcRenderer.invoke('lockdown:stop'),
  quit: () => ipcRenderer.invoke('app:quit'),
  // returns an "unsubscribe" function
  onViolation: (callback) => {
    const listener = (_event, reason) => callback(reason)
    ipcRenderer.on('violation', listener)
    return () => ipcRenderer.removeListener('violation', listener)
  },
})
