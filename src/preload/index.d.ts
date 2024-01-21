import { ElectronAPI } from '@electron-toolkit/preload'
import TransactionResponse from '../renderer/src/models/transactionResponse'
import UserSettings from '../renderer/src/models/userSettings'
import ImportTransactionResponse from '../renderer/src/models/importTransactionResponse'

interface API {
  /* Dialog API */
  importTransactions: () => Promise<ImportTransactionResponse>
  /* Transactions API */
  getTransactions: (amount: number, offset: number) => Promise<TransactionResponse>
  deleteTransactions: (ids: number[]) => Promise<void>
  /* UserSettings API */
  getUserSettings: () => Promise<UserSettings>
  updateUserSettings: (userSettings: UserSettings) => Promise<void>
  /* Tag API */
  deleteTag: (id: number) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
