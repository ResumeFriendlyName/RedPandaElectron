import { ParseResult, parse } from 'papaparse'
import { readFileSync } from 'fs'
import { dialog } from 'electron'

export async function importTransactionFiles(
  browserWindow: Electron.BrowserWindow
): Promise<string[]> {
  const { canceled, filePaths } = await dialog.showOpenDialog(browserWindow, {
    title: 'Import bank statement(s)',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'ANZ (pdf)', extensions: ['pdf'] },
      { name: 'Bank Australia (csv)', extensions: ['csv'] },
      { name: 'Commonwealth Bank (pdf)', extensions: ['pdf'] },
      { name: 'NAB (pdf)', extensions: ['pdf'] }
    ]
  })

  const transactions: string[] = []

  if (!canceled) {
    filePaths.map((filePath) => {
      const file = readFileSync(filePath, 'utf8')
      parse(file, {
        complete: function (results: ParseResult<string>) {
          transactions.push(results.data)
        }
      })
    })
  }

  return transactions
}
