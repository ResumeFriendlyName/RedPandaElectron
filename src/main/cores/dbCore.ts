import { app } from 'electron'
import { Database } from 'sqlite3'
import Transaction from '../../renderer/src/models/transaction'

export function setupDatabase(): Database {
  const appPath = app.getPath('appData') + '/' + app.getName()

  /* Open database file */
  const db = new Database(appPath + '/appData.sqlite3', (err) => {
    if (err) {
      console.error(err.message)
    } else {
      console.log('Connected to the app-data database.')
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
    date TEXT NOT NULL,
    description TEXT,
    amount REAL,
    balance REAL)`)
}

export function insertTransaction(db: Database, transactions: Transaction[]): void {
  transactions.map((transaction) =>
    db.run(
      `INSERT INTO transactions(date, description, amount, balance) 
      VALUES(?, ?, ?, ?)`,
      [transaction.date, transaction.description, transaction.amount, transaction.balance]
    )
  )
}
