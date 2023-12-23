import { ElectronAPI } from '@electron-toolkit/preload'

interface API {
  importTransactions: () => Promise<string>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
