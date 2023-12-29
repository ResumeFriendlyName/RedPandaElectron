import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { importTransactionFiles } from './cores/dialogCore'
import {
  closeDatabase,
  getTransactions,
  getTransactionsCount,
  getUserSettings,
  insertTransactions,
  setupDatabase,
  updateUserSettings
} from './cores/dbCore'
import { translateBATransactions } from './cores/translationCore'
import TransactionResponse from '../renderer/src/models/transactionResponse'
import UserSettings from '../renderer/src/models/userSettings'
import { Database } from 'sqlite3'

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
    icon: '../../public/redPandaLogo.png',
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
    // Register file listener for importing CSV transaction files
    ipcMain.handle('dialog:importTransactions', () => {
      return new Promise<void>((resolve, reject) => {
        getUserSettings(db)
          .then(async (userSettings) => {
            return importTransactionFiles(window, userSettings.bankPref).then(
              async (stringTransactions) => {
                if (stringTransactions.length > 0) {
                  return insertTransactions(db, translateBATransactions(stringTransactions)).then(
                    () => resolve()
                  )
                }
                resolve()
              }
            )
          })
          .catch((err) => reject(err))
      })
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

  ipcMain.handle('db:getTransactions', async (_, amount: number, offset: number) => {
    return new Promise<TransactionResponse>((resolve, reject) => {
      getTransactions(db, amount, offset)
        .then(async (transactions) => {
          return getTransactionsCount(db).then((count) => {
            const response: TransactionResponse = { transactions, count }
            resolve(response)
          })
        })
        .catch((err: Error) => reject(err))
    })
  })

  ipcMain.handle('db:getUserSettings', async () => {
    return new Promise<UserSettings>((resolve, reject) => {
      getUserSettings(db)
        .then((userSettings) => resolve(userSettings))
        .catch((err) => reject(err))
    })
  })

  ipcMain.handle('db:updateUserSettings', async (_, userSettings: UserSettings) => {
    return new Promise<void>((resolve, reject) => {
      updateUserSettings(db, userSettings)
        .then(() => resolve())
        .catch((err) => reject(err))
    })
  })
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
