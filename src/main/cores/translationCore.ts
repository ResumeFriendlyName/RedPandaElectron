import { readFileSync } from 'fs'
import { ParseResult, parse } from 'papaparse'

import Transaction from '../../renderer/src/models/transaction'

export function parseTransactionFiles(filePaths: string[]): string[] {
  const transactions: string[] = []
  filePaths.map((filePath) => {
    const file = readFileSync(filePath, 'utf8')
    parse(file, {
      complete: function (results: ParseResult<string>) {
        transactions.push(results.data)
      }
    })
  })
  return transactions
}

export function translateBATransactions(transactions: string[]): Transaction[] {
  return transactions
    .flat()
    .filter((transaction) => !transaction[0].includes('Effective') && transaction.length != 1)
    .map((transaction) => {
      const [day, month, year] = transaction[1].split('/').map(Number)
      // ISOString format (without Time)
      const date = `${year}-${month}-${day}`
      return {
        id: -1,
        date: date,
        description: transaction[2],
        amount: Number(transaction[3]),
        balance: Number(transaction[4])
      }
    })
}

export function translateCBTransactions(transactions: string[]): Transaction[] {
  return transactions
    .flat()
    .filter((transaction) => transaction.length === 4)
    .map((transaction) => {
      const [day, month, year] = transaction[0].split('/').map(Number)
      // ISOString format (without Time)
      const date = `${year}-${month}-${day}`
      return {
        id: -1,
        date: date,
        description: transaction[2],
        amount: Number(transaction[1]),
        balance: Number(transaction[3])
      }
    })
}
