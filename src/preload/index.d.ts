import { ElectronAPI } from '@electron-toolkit/preload'
import TransactionResponse from '../renderer/src/models/transactionResponse'
import UserSettings from '../renderer/src/models/userSettings'
import ImportTransactionResponse from '../renderer/src/models/importTransactionResponse'
import Tag from '@renderer/models/tag'
import Transaction from '@renderer/models/transaction'

interface API {
  /* Dialog API */
  importTransactions: () => Promise<ImportTransactionResponse>
  /* Transactions API */
  getTransactions: (amount: number, offset: number) => Promise<TransactionResponse>
  deleteTransactions: (ids: number[]) => Promise<void>
  getCashFlow: (startDate: string, endDate: string) => Promise<CashFlow>
  /* UserSettings API */
  getUserSettings: () => Promise<UserSettings>
  updateUserSettings: (userSettings: UserSettings) => Promise<void>
  /* Tag API */
  insertTag: (tag: Tag) => Promise<number>
  deleteTag: (id: number) => Promise<void>
  getTags: (nameFilter?: string) => Promise<Tag[]>
  getTagAmounts: (startDate: string, endDate: string) => Promise<TagAmount[]>
  insertTagWithTransaction: (tag: Tag, transaction: Transaction) => Promise<void>
  deleteTagWithTransaction: (tagId: number, transactionId: number) => Promise<void>
  /* TagRule API */
  applyTagRuleToTransactions: (tagId: number) => Promise<number>
  getTagRuleForTagId: (tagId: number) => Promise<TagRule | undefined>
  updateTagRuleForTagId: (tagId: number, values: string[]) => Promise<void>
  insertTagRuleForTagId: (tagId: number, values: string[]) => Promise<void>
  deleteTagRuleForTagId: (tagId: number) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
