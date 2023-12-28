import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import TransactionResponse from '../renderer/src/models/transactionResponse'
import UserSettings from '../renderer/src/models/userSettings'

// Custom APIs for renderer
const api = {
  /* File API */
  importTransactions: (): Promise<void> => ipcRenderer.invoke('dialog:importTransactions'),
  /* DB API */
  getTransactions: (amount: number, offset: number): Promise<TransactionResponse> =>
    ipcRenderer.invoke('db:getTransactions', amount, offset),
  getUserSettings: (): Promise<UserSettings> => ipcRenderer.invoke('db:getUserSettings'),
  updateUserSettings: (userSettings: UserSettings): Promise<void> =>
    ipcRenderer.invoke('db:updateUserSettings', userSettings)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
