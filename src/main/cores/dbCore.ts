import { app } from 'electron'
import { Database, RunResult } from 'sqlite3'
import Transaction from '../../renderer/src/models/transaction'

export function setupDatabase(): Database {
  const appPath = app.getPath('appData') + '/' + app.getName()

  /* Open database file */
  const db = new Database(appPath + '/appData.sqlite3', (err) => {
    if (err) {
      console.error(err.message)
    }
  })

  /* Create tables if not already created */
  createTransactionsTable(db)

  return db
}

export function closeDatabase(db: Database): void {
  db.close()
}

function createTransactionsTable(db: Database): void {
  db.run(`CREATE TABLE IF NOT EXISTS transactions ( 
    id INTEGER NOT NULL PRIMARY KEY,
    date TEXT NOT NULL,
    description TEXT,
    amount REAL,
    balance REAL)`)
}

export async function getTransactionsCount(db: Database): Promise<number> {
  return new Promise<number>((resolve, reject) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.get('SELECT COUNT(id) FROM transactions', (err, count: any) => {
      if (err) {
        console.error(err.message)
        reject(0)
      }
      resolve(count['COUNT(id)'] as number)
    })
  )
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
        console.error(err.message)
        reject([])
      }
      resolve(transactions)
    })
  )
}

export async function insertTransactions(
  db: Database,
  transactions: Transaction[]
): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    transactions.map((transaction, index) =>
      db.run(
        `INSERT INTO transactions(date, description, amount, balance) 
      VALUES(?, ?, ?, ?)`,
        [transaction.date, transaction.description, transaction.amount, transaction.balance],
        function (this: RunResult, err: Error | null) {
          if (err) {
            reject(err.message)
          } else {
            // Used to let the frontend know all transactions have been completed asynchronously
            if (index === transactions.length - 1) {
              resolve('')
            }
          }
        }
      )
    )
  })
}
