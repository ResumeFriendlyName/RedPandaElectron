import { ElectronAPI } from '@electron-toolkit/preload'

interface API {
  importTransactions: () => Promise<string>
  getTransactions: (amount: number, offset: number) => Promise<Transaction[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
