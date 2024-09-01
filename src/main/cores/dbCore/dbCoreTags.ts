import { Database, RunResult } from 'sqlite3'
import Tag from '../../../renderer/src/models/tag'
import Transaction from '../../../renderer/src/models/transaction'
import TransactionWithTags from '../../../renderer/src/models/transactionWithTags'
import TagAmount from '../../../renderer/src/models/tagAmount'

export function getTagAmounts(
  db: Database,
  tags: Tag[],
  startDate: string,
  endDate: string
): Promise<TagAmount[]> {
  return new Promise((resolve, reject) => {
    const promiseBase = (tag: Tag): Promise<TagAmount> =>
      new Promise<TagAmount>((resolveValue) => {
        db.get(
          `
          SELECT SUM(amount) 
          FROM transactions 
          INNER JOIN tagsAndTransactions ON tagsAndTransactions.transactionId = transactions.id
          WHERE tagsAndTransactions.tagId = ? AND date BETWEEN ? AND ?`,
          [tag.id, startDate, endDate],
          (error, value_dict: [string: number]) => {
            if (error) {
              reject(error)
            }
            const key = 'SUM(amount)'
            const value: number = value_dict[key] ?? 0
            resolveValue({ tag: tag, amount: value })
          }
        )
      })
    resolve(Promise.all(tags.map((tag) => promiseBase(tag))))
  })
}

export function getTags(db: Database, nameFilter: string): Promise<Tag[]> {
  const wildCardName = `%${nameFilter}%`
  return new Promise<Tag[]>((resolve, reject) => {
    db.all(
      `SELECT * FROM tags WHERE "name" LIKE ? ORDER BY name ASC`,
      [wildCardName],
      (error, rows: Tag[]) => {
        if (error) {
          reject(error)
        }
        resolve(rows)
      }
    )
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

export function insertTag(db: Database, tag: Tag): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    db.run(
      `INSERT INTO tags(name) VALUES(?)`,
      [tag.name],
      function (this: RunResult, error: Error) {
        if (error) {
          reject(error)
        }
        resolve(this.lastID)
      }
    )
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
  tagId: number,
  transactionId: number
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.run(
      `INSERT INTO tagsAndTransactions(tagId, transactionId) VALUES(?, ?)`,
      [tagId, transactionId],
      (_, err: Error) => {
        if (err) {
          reject(err)
        }
        resolve()
      }
    )
  })
}
