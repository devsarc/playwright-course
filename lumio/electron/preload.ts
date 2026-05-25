import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('lumioElectron', {
  platform: process.platform,
  version: process.versions.electron,
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
});
