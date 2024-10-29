import { Database } from 'sqlite3'
import Transaction from '../../../renderer/src/models/transaction'
import CashFlow from '../../../renderer/src/models/cashflow'

export function getCashFlowInDateRange(
  db: Database,
  startDate: string,
  endDate: string
): Promise<CashFlow> {
  return new Promise<CashFlow>((resolve, reject) => {
    const promiseBase = (amountConditionalString: string): Promise<number> =>
      new Promise<number>((resolveValue) => {
        db.get(
          `SELECT SUM(amount) FROM transactions WHERE date BETWEEN ? AND ? AND ${amountConditionalString}`,
          [startDate, endDate],
          (err, value: number) => {
            if (err) {
              reject(err)
            }
            resolveValue(value)
          }
        )
      })

    Promise.all([promiseBase('amount < 0'), promiseBase('amount > 0')]).then((values) => {
      const key = 'SUM(amount)'
      const grossExpenses = Math.abs(values[0][key]) ?? 0
      const grossIncome = values[1][key] ?? 0
      resolve({
        grossExpenses: grossExpenses,
        grossIncome: grossIncome,
        netIncome: grossIncome - grossExpenses
      })
    })
  })
}

export function getDuplicateTransactions(
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

export function getTransactionsCount(db: Database): Promise<number> {
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
    if (!ids.length) {
      resolve()
    }

    const deletePromises = ids.map(
      (id) =>
        new Promise<void>((resolveDelete) => {
          db.serialize(() => {
            db.run(`DELETE FROM tagsAndTransactions WHERE transactionId = ?`, [id], (err) => {
              if (err) {
                reject(err)
              }
            })
            db.run(`DELETE FROM transactions WHERE id = ?`, [id], (err) =>
              err ? reject(err) : resolveDelete()
            )
          })
        })
    )

    Promise.all(deletePromises)
      .then(() => resolve())
      .catch(reject)
  })
}

export function getTransaction(db: Database, id: number): Promise<Transaction> {
  return new Promise<Transaction>((resolve, reject) => {
    db.get(`SELECT * FROM transactions WHERE id = ?`, [id], (err: Error, row: Transaction) =>
      err ? reject(err) : resolve(row)
    )
  })
}

export function getTransactions(
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
          function (err) {
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
