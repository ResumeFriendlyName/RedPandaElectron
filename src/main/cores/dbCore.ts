import { app } from 'electron'
import { Database, RunResult } from 'sqlite3'
import Transaction from '../../renderer/src/models/transaction'
import UserSettings from '../../renderer/src/models/userSettings'
import { BankType } from '../../renderer/src/models/types'
import { fatalError } from './dialogCore'
import Tag from '../../renderer/src/models/tag'

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
  createTagsTable(db)
  createTagsAndTransactionsTable(db)

  return db
}

export function closeDatabase(db: Database): void {
  db.close()
}

function createTagsAndTransactionsTable(db: Database): void {
  db.run(`CREATE TABLE IF NOT EXISTS tagsAndtransactions (
    id INTEGER NOT NULL PRIMARY KEY,
    tagId INTEGER NOT NULL,
    transactionId INTEGER NOT NULL)`)
}

function createTagsTable(db: Database): void {
  db.run(`CREATE TABLE IF NOT EXISTS tags (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE)
  `)
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

export function getTags(db: Database): Promise<Tag[]> {
  return new Promise<Tag[]>((resolve, reject) => {
    db.all(`SELECT * FROM tags`, (error, rows: Tag[]) => {
      if (error) {
        reject(error)
      }
      resolve(rows)
    })
  })
}

export function updateTag(db: Database, tag: Tag): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.run(`UPDATE tags SET name = ? WHERE id = ?`, [tag.name, tag.id], (_, error: Error) => {
      if (error) {
        reject(error)
      }
      resolve()
    })
  })
}

export function insertTag(db: Database, tag: Tag): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.run(`INSERT INTO tags(name) VALUES(?)`, [tag.name], (_, error: Error) => {
      if (error) {
        reject(error)
      }
      resolve()
    })
  })
}

export function deleteTag(db: Database, tag: Tag): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      db.run(`DELETE FROM tags WHERE id = ?`, [tag.id], (_, error: Error) => {
        if (error) {
          reject(error)
        }
      })
      db.run(`DELETE FROM tagsAndTransactions WHERE tagId = ?`, [tag.id], (_, error: Error) => {
        if (error) {
          reject(error)
        }
      })
      resolve()
    })
  })
}

export function deleteTagAndTransaction(
  db: Database,
  tag: Tag,
  transaction: Transaction
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.run(
      `DELETE FROM tagsAndTransactions WHERE tagId = ? AND transactionId = ?`,
      [tag.id, transaction.id],
      (_, error: Error) => {
        if (error) {
          reject(error)
        }
        resolve()
      }
    )
  })
}

export function insertTagAndTransaction(
  db: Database,
  tag: Tag,
  transaction: Transaction
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.run(
      `INSERT INTO tagsAndTransactions(tagId, transactionId) VALUES(?, ?)`,
      [tag.id, transaction.id],
      (_, err: Error) => {
        if (err) {
          reject(err)
        }
        resolve()
      }
    )
  })
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

export async function getPotentialDuplicateTransactions(
  db: Database,
  transactions: Transaction[]
): Promise<Transaction[]> {
  return new Promise<Transaction[]>((resolve, reject) => {
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
    const ids: number[] = []

    if (transactions.length == 0) {
      resolve([])
    }

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
