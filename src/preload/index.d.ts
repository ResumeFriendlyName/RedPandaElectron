import { ElectronAPI } from '@electron-toolkit/preload'
import ImportTransactionResponse from '@renderer/models/importTransactionResponse'
import TransactionResponse from '@renderer/models/transactionResponse'
import UserSettings from '@renderer/models/userSettings'

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
