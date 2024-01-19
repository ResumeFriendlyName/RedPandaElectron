import { Database } from 'sqlite3'
import Tag from '../../../renderer/src/models/tag'
import Transaction from '../../../renderer/src/models/transaction'

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
