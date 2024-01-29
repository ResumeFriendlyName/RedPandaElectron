import { app } from 'electron'
import { Database } from 'sqlite3'
import { BankType } from '../../../renderer/src/models/types'
import { fatalError } from '../dialogCore'

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
  db.run(`CREATE TABLE IF NOT EXISTS tagsAndTransactions (
    id INTEGER NOT NULL PRIMARY KEY,
    tagId INTEGER NOT NULL,
    transactionId INTEGER NOT NULL,
    UNIQUE(tagId, transactionId))`)
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
    bankPref TEXT NOT NULL
  )`,
    () => {
      db.run(`INSERT INTO userSettings SELECT 1, ? WHERE NOT EXISTS (SELECT * FROM userSettings)`, [
        BankType.UNSPECIFIED
      ])
    }
  )
}
