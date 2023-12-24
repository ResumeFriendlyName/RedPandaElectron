import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { importTransactionFiles } from './cores/fileCore'
import { closeDatabase, getTransactions, insertTransactions, setupDatabase } from './cores/dbCore'
import { translateBATransactions } from './cores/translationCore'
import Transaction from '../renderer/src/models/transaction'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
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

  const db = setupDatabase()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
    // Register file listener for importing CSV transaction files
    ipcMain.handle('dialog:importTransactions', async () => {
      const statusMsg: string = await importTransactionFiles(window)
        .then(async (stringTransactions) => {
          // TODO: Need to select bank as user setting before importing
          return await insertTransactions(db, translateBATransactions(stringTransactions))
            .then((msg: string) => msg)
            .catch((err: string) => err)
        })
        .catch((err) => {
          console.error(err)
          return "Couldn't convert data to target format"
        })
      return statusMsg
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
    const transactions: Transaction[] = await getTransactions(db, amount, offset)
      .then((transactions) => transactions)
      .catch((err: []) => err)
    return transactions
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
