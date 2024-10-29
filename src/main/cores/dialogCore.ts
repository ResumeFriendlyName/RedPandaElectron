import { app, dialog } from 'electron'
import { BankType } from '../../renderer/src/models/types'
import { parseTransactionFiles } from './translationCore'

export function fatalError(message: string): void {
  dialog.showErrorBox('FATAL ERROR', message)
  app.quit()
}

export async function importTransactionFiles(
  browserWindow: Electron.BrowserWindow,
  bankPref: BankType
): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    const filter: Electron.FileFilter = ((): Electron.FileFilter => {
      switch (bankPref) {
        case BankType.BANK_AUSTRALIA:
          return { name: 'Bank Australia (csv)', extensions: ['csv'] }
        case BankType.COMMONWEALTH_BANK:
          return { name: 'Commonwealth Bank (csv)', extensions: ['csv'] }
        default:
          return { name: '', extensions: [''] } // Redundant line to make linter happy
      }
    })()

    if (filter.name === '') {
      return reject('Bank preference not specified')
    }

    dialog
      .showOpenDialog(browserWindow, {
        title: 'Import bank statement(s)',
        properties: ['openFile', 'multiSelections'],
        filters: [filter]
      })
      .then(({ canceled, filePaths }) => {
        if (!canceled) {
          switch (bankPref) {
            case BankType.BANK_AUSTRALIA:
            case BankType.COMMONWEALTH_BANK:
              resolve(parseTransactionFiles(filePaths))
              break
            default:
              reject(`BankType ${bankPref} parsing not implemented!`)
          }
        }
        resolve([])
      })
      .catch((err) => reject(err))
  })
}
