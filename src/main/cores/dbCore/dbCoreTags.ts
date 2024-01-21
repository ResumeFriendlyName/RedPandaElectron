import { Database } from 'sqlite3'
import Tag from '../../../renderer/src/models/tag'
import Transaction from '../../../renderer/src/models/transaction'
import TransactionWithTags from '../../../renderer/src/models/transactionWithTags'

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

export function deleteTag(db: Database, id: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      db.run(`DELETE FROM tags WHERE id = ?`, [id], (_, error: Error) => {
        if (error) {
          reject(error)
        }
      })
      db.run(`DELETE FROM tagsAndTransactions WHERE tagId = ?`, [id], (_, error: Error) => {
        if (error) {
          reject(error)
        }
      })
      resolve()
    })
  })
}

export function getTagsWithTransactions(
  db: Database,
  transactions: Transaction[]
): Promise<TransactionWithTags[]> {
  return new Promise<TransactionWithTags[]>((resolve, reject) => {
    if (transactions.length == 0) {
      resolve([])
    }

    db.serialize(() => {
      const transactionsWithTags: TransactionWithTags[] = []
      transactions.map((transaction, index) =>
        db.all(
          `
            SELECT * FROM tags 
            WHERE id IN (
              SELECT tagId FROM tagsAndTransactions 
              WHERE transactionId = ?
            )`,
          [transaction.id],
          (err, tags: Tag[]) => {
            if (err) {
              reject(err)
            }

            transactionsWithTags.push({ transaction, tags })
            if (index === transactions.length - 1) {
              resolve(transactionsWithTags)
            }
          }
        )
      )
    })
  })
}

export function deleteTagAndTransaction(
  db: Database,
  tagId: number,
  transactionId: number
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.run(
      `DELETE FROM tagsAndTransactions WHERE tagId = ? AND transactionId = ?`,
      [tagId, transactionId],
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
