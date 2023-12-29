import { ParseResult, parse } from 'papaparse'
import { readFileSync } from 'fs'
import { app, dialog } from 'electron'
import { BankType } from '../../renderer/src/models/types'

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
          return { name: 'Commonwealth Bank (pdf)', extensions: ['pdf'] }
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
          const transactions: string[] = []
          filePaths.map((filePath) => {
            const file = readFileSync(filePath, 'utf8')
            parse(file, {
              complete: function (results: ParseResult<string>) {
                transactions.push(results.data)
              }
            })
          })
          resolve(transactions)
        }
        resolve([])
      })
      .catch((err) => reject(err))
  })
}
