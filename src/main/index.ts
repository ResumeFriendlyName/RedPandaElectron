import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { fatalError, importTransactionFiles } from './cores/dialogCore'
import { closeDatabase, setupDatabase } from './cores/dbCore/dbCore'
import { translateBATransactions, translateCBTransactions } from './cores/translationCore'
import TransactionResponse from '../renderer/src/models/transactionResponse'
import UserSettings from '../renderer/src/models/userSettings'
import { Database } from 'sqlite3'
import Transaction from '../renderer/src/models/transaction'
import ImportTransactionResponse from '../renderer/src/models/importTransactionResponse'
import {
  deleteTransactions,
  getCashFlowInDateRange,
  getDuplicateTransactions,
  getTransactions,
  getTransactionsCount,
  insertTransactions
} from './cores/dbCore/dbCoreTransactions'
import { getUserSettings, updateUserSettings } from './cores/dbCore/dbCoreUserSettings'
import {
  applyTagRulesToTransactions,
  applyTagRuleToTransactions,
  deleteTag,
  deleteTagAndTransaction,
  deleteTagRuleForTagId,
  getTagAmounts,
  getTagRuleForTagId,
  getTags,
  getTagsWithTransactions,
  insertTag,
  insertTagAndTransaction,
  insertTagRuleForTagId,
  updateTag
} from './cores/dbCore/dbCoreTags'
import Tag from '../renderer/src/models/tag'
import CashFlow from '../renderer/src/models/cashflow'
import TagAmount from '../renderer/src/models/tagAmount'
import TagRule from '../renderer/src/models/tagRule'
import { BankType } from '../renderer/src/models/types'
import { getIconPath } from './utils'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 864,
    minHeight: 543,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    icon: getIconPath(),
    titleBarStyle: 'hidden',
    titleBarOverlay: true
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  const db: Database = setupDatabase()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)

    ipcMain.handle('dialog:importTransactions', async (): Promise<ImportTransactionResponse> => {
      const userSettings: UserSettings = await getUserSettings(db)
      const stringTransactions = await importTransactionFiles(window, userSettings.bankPref)

      if (stringTransactions.length > 0) {
        let transactions: Transaction[] = []
        switch (userSettings.bankPref) {
          case BankType.BANK_AUSTRALIA:
            transactions = translateBATransactions(stringTransactions)
            break
          case BankType.COMMONWEALTH_BANK:
            transactions = translateCBTransactions(stringTransactions)
            break
          default:
            fatalError(`BankType ${userSettings.bankPref} translation not implemented!`)
        }
        const dupeTransactions: Transaction[] = await getDuplicateTransactions(db, transactions)
        const uniqueTransactions: Transaction[] = transactions.filter(
          (transaction) => !dupeTransactions.includes(transaction)
        )
        const transactionIds: number[] = await insertTransactions(db, uniqueTransactions)
        await applyTagRulesToTransactions(db, transactionIds)

        return { transactionIds, dupeTransactions }
      }

      return { transactionIds: [], dupeTransactions: [] }
    })
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('before-quit', function () {
    closeDatabase(db)
  })

  ipcMain.handle(
    'db:getTransactions',
    async (_, amount: number, offset: number): Promise<TransactionResponse> => {
      const transactions = await getTransactions(db, amount, offset)
      const transactionsWithTags = await getTagsWithTransactions(db, transactions)
      const count = await getTransactionsCount(db)

      return {
        transactionsWithTags,
        count
      }
    }
  )
  ipcMain.handle(
    'db:deleteTransactions',
    (_, ids: number[]): Promise<void> => deleteTransactions(db, ids)
  )
  ipcMain.handle(
    'db:getCashFlow',
    (_, startDate: string, endDate: string): Promise<CashFlow> =>
      getCashFlowInDateRange(db, startDate, endDate)
  )

  ipcMain.handle('db:getUserSettings', (): Promise<UserSettings> => getUserSettings(db))
  ipcMain.handle(
    'db:updateUserSettings',
    (_, userSettings: UserSettings): Promise<void> => updateUserSettings(db, userSettings)
  )

  ipcMain.handle('db:getTagAmounts', async (_, startDate, endDate): Promise<TagAmount[]> => {
    const tags: Tag[] = await getTags(db, '')
    return getTagAmounts(db, tags, startDate, endDate)
  })

  ipcMain.handle('db:getTags', (_, nameFilter: string): Promise<Tag[]> => getTags(db, nameFilter))
  ipcMain.handle('db:insertTag', (_, tag: Tag): Promise<number> => insertTag(db, tag))
  ipcMain.handle('db:updateTag', (_, tag: Tag): Promise<void> => updateTag(db, tag))
  ipcMain.handle('db:deleteTag', (_, id: number): Promise<void> => deleteTag(db, id))

  ipcMain.handle(
    'db:insertTagWithTransaction',
    async (_, tag: Tag, transaction: Transaction): Promise<void> => {
      if (tag.id == -1) {
        tag.id = await insertTag(db, tag)
      }
      return insertTagAndTransaction(db, tag.id, transaction.id)
    }
  )
  ipcMain.handle(
    'db:deleteTagWithTransaction',
    (_, tagId: number, transactionId: number): Promise<void> =>
      deleteTagAndTransaction(db, tagId, transactionId)
  )

  ipcMain.handle(
    'db:applyTagRuleToTransactions',
    async (_, tagId: number): Promise<number> => applyTagRuleToTransactions(db, tagId)
  )
  ipcMain.handle(
    'db:getTagRuleForTagId',
    async (_, tagId: number): Promise<TagRule | undefined> => getTagRuleForTagId(db, tagId)
  )
  ipcMain.handle(
    'db:updateTagRuleForTagId',
    async (_, tagId: number, values: string[]): Promise<void> => {
      // This should be fine since I can't imagine there'll be loads of rules per tag
      // Greatly simplifies logic around codebase, especially in the tagRuleModal
      await deleteTagRuleForTagId(db, tagId)
      await insertTagRuleForTagId(db, tagId, values)
    }
  )
  ipcMain.handle(
    'db:insertTagRuleForTagId',
    async (_, tagId: number, values: string[]): Promise<void> =>
      insertTagRuleForTagId(db, tagId, values)
  )
  ipcMain.handle('db:deleteTagRuleForTagId', async (_, tagId: number) =>
    deleteTagRuleForTagId(db, tagId)
  )
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  /* Remove handlers using window to not recreate if opened again (but not quit) -> for MacOS */
  ipcMain.removeHandler('dialog:importTransactions')
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
