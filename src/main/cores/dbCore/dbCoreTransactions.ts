import { Database, RunResult } from 'sqlite3'
import Transaction from '../../../renderer/src/models/transaction'

export async function getDuplicateTransactions(
  db: Database,
  transactions: Transaction[]
): Promise<Transaction[]> {
  return new Promise<Transaction[]>((resolve, reject) => {
    if (transactions.length == 0) {
      resolve([])
    }

    const dupeTransactions: Transaction[] = []
    db.serialize(() => {
      transactions.map((transaction, index) => {
        db.get(
          `SELECT * FROM transactions WHERE date = ? AND description = ? AND amount = ? AND balance = ?`,
          [transaction.date, transaction.description, transaction.amount, transaction.balance],
          (err, dupeTransaction: Transaction | undefined) => {
            if (err) {
              reject(err)
            }
            if (dupeTransaction !== undefined) {
              dupeTransactions.push(transaction)
            }
            if (index === transactions.length - 1) {
              resolve(dupeTransactions)
            }
          }
        )
      })
    })
  })
}

export async function getTransactionsCount(db: Database): Promise<number> {
  return new Promise<number>((resolve, reject) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.get('SELECT COUNT(id) FROM transactions', (err, count: any) => {
      if (err) {
        reject(err)
      }
      resolve(count['COUNT(id)'] as number)
    })
  )
}

export function deleteTransactions(db: Database, ids: number[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (ids.length == 0) {
      resolve()
    }

    db.serialize(() =>
      ids.map((id, index) =>
        db.run(`DELETE FROM transactions WHERE id = ?`, [id], (_, err: Error) => {
          if (err) {
            reject(err)
          }
          if (index === ids.length - 1) {
            resolve()
          }
        })
      )
    )
  })
}

export async function getTransactions(
  db: Database,
  amount: number,
  offset: number
): Promise<Transaction[]> {
  const query = `SELECT * FROM transactions ORDER BY "date" DESC LIMIT ${amount} OFFSET ${offset}`
  return new Promise<Transaction[]>((resolve, reject) =>
    db.all(query, [], (err, transactions: Transaction[]) => {
      if (err) {
        reject(err)
      }
      resolve(transactions)
    })
  )
}

export async function insertTransactions(
  db: Database,
  transactions: Transaction[]
): Promise<number[]> {
  return await new Promise<number[]>((resolve, reject) => {
    if (transactions.length == 0) {
      resolve([])
    }

    const ids: number[] = []
    db.serialize(() =>
      transactions.map((transaction, index) =>
        db.run(
          `INSERT INTO transactions(date, description, amount, balance) VALUES(?, ?, ?, ?)`,
          [transaction.date, transaction.description, transaction.amount, transaction.balance],
          function (this: RunResult, err: Error | null) {
            if (err) {
              reject(err)
            } else {
              ids.push(this.lastID)
              // Used to let the frontend know all transactions have been completed asynchronously
              if (index === transactions.length - 1) {
                resolve(ids)
              }
            }
          }
        )
      )
    )
  })
}
