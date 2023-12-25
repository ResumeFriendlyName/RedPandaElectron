import { ElectronAPI } from '@electron-toolkit/preload'
import TransactionResponse from '@renderer/models/transactionResponse'

interface API {
  importTransactions: () => Promise<string>
  getTransactions: (amount: number, offset: number) => Promise<TransactionResponse>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
