import { ElectronAPI } from '@electron-toolkit/preload'
import TransactionResponse from '../renderer/src/models/transactionResponse'
import UserSettings from '../renderer/src/models/userSettings'
import ImportTransactionResponse from '../renderer/src/models/importTransactionResponse'

interface API {
  importTransactions: () => Promise<ImportTransactionResponse>
  getTransactions: (amount: number, offset: number) => Promise<TransactionResponse>
  deleteTransactions: (ids: number[]) => Promise<void>
  getUserSettings: () => Promise<UserSettings>
  updateUserSettings: (userSettings: UserSettings) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
