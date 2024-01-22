import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import TransactionResponse from '../renderer/src/models/transactionResponse'
import UserSettings from '../renderer/src/models/userSettings'
import ImportTransactionResponse from '../renderer/src/models/importTransactionResponse'
import Tag from '../renderer/src/models/tag'
import Transaction from '../renderer/src/models/transaction'

// Custom APIs for renderer
const api = {
  /* Dialog API */
  importTransactions: (): Promise<ImportTransactionResponse> =>
    ipcRenderer.invoke('dialog:importTransactions'),
  /* Transactions API */
  getTransactions: (amount: number, offset: number): Promise<TransactionResponse> =>
    ipcRenderer.invoke('db:getTransactions', amount, offset * amount),
  deleteTransactions: (ids: number[]): Promise<void> =>
    ipcRenderer.invoke('db:deleteTransactions', ids),
  /* UserSettings API */
  getUserSettings: (): Promise<UserSettings> => ipcRenderer.invoke('db:getUserSettings'),
  updateUserSettings: (userSettings: UserSettings): Promise<void> =>
    ipcRenderer.invoke('db:updateUserSettings', userSettings),
  /* Tag API */
  deleteTag: (id: number): Promise<void> => ipcRenderer.invoke('db:deleteTag', id),
  getTags: (): Promise<Tag[]> => ipcRenderer.invoke('db:getTags'),
  insertTagWithTransaction: (tag: Tag, transaction: Transaction): Promise<void> =>
    ipcRenderer.invoke('db:insertTagWithTransaction', tag, transaction),
  deleteTagWithTransaction: (tagId: number, transactionId: number): Promise<void> =>
    ipcRenderer.invoke('db:deleteTagWithTransaction', tagId, transactionId)
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
