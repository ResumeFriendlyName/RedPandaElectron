import { app } from 'electron'
import { Database, RunResult } from 'sqlite3'
import Transaction from '../../renderer/src/models/transaction'
import UserSettings from '../../renderer/src/models/userSettings'
import { BankType } from '../../renderer/src/models/types'
import { fatalError } from './dialogCore'

export function setupDatabase(): Database {
  const appPath = app.getPath('appData') + '/' + app.getName() + '/'
  const dbPath = app.isPackaged ? 'appData.sqlite3' : 'appDataDev.sqlite3'

  /* Open database file */
  const db = new Database(appPath + dbPath, (err) => {
    if (err) {
      fatalError(err.message)
    }
  })

  /* Create tables if not already created */
  createTransactionsTable(db)
  createUserSettingsTable(db)

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

function createUserSettingsTable(db: Database): void {
  db.run(
    `CREATE TABLE IF NOT EXISTS userSettings (
    id INTEGER NOT NULL PRIMARY KEY,
    bankPref TEXT NOT NULL UNIQUE
  )`,
    () => {
      db.run(`INSERT INTO userSettings SELECT 1, ? WHERE NOT EXISTS (SELECT * FROM userSettings)`, [
        BankType.UNSPECIFIED
      ])
    }
  )
}

export function getUserSettings(db: Database): Promise<UserSettings> {
  return new Promise<UserSettings>((resolve, reject) => {
    db.get('SELECT * FROM userSettings', (err, userSettings: UserSettings) => {
      if (err) {
        reject(err)
      }
      resolve(userSettings)
    })
  })
}

export function updateUserSettings(db: Database, userSettings: UserSettings): Promise<void> {
  return new Promise<void>((resolve, reject) =>
    db.run(
      `UPDATE userSettings SET bankPref = ? WHERE id = 1`,
      [userSettings.bankPref],
      (_, err: Error) => {
        if (err) {
          reject(err)
        }
        resolve()
      }
    )
  )
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
    const ids: number[] = []
    transactions.map((transaction, index) =>
      db.run(
        `INSERT INTO transactions(date, description, amount, balance) 
      VALUES(?, ?, ?, ?)`,
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
  })
}
