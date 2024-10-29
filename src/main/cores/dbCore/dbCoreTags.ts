import { Database } from 'sqlite3'
import Tag from '../../../renderer/src/models/tag'
import Transaction from '../../../renderer/src/models/transaction'
import TransactionWithTags from '../../../renderer/src/models/transactionWithTags'
import TagAmount from '../../../renderer/src/models/tagAmount'
import TagRule from '../../../renderer/src/models/tagRule'
import { getTransaction } from './dbCoreTransactions'

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
          (error, valueDict: [string: number]) => {
            if (error) {
              reject(error)
            }
            const key = 'SUM(amount)'
            const value: number = valueDict[key] ?? 0
            resolveValue({ tag: tag, amount: value })
          }
        )
      })
    resolve(Promise.all(tags.map(promiseBase)))
  })
}

export function getTag(db: Database, id: number): Promise<Tag> {
  return new Promise<Tag>((resolve, reject) => {
    db.get(`SELECT * FROM tags WHERE id = ?`, [id], (err: Error, row: Tag) =>
      err ? reject(err) : resolve(row)
    )
  })
}

export function getTags(db: Database, nameFilter: string): Promise<Tag[]> {
  return new Promise<Tag[]>((resolve, reject) => {
    const wildCardName = `%${nameFilter}%`
    db.all(
      `SELECT * FROM tags WHERE "name" LIKE ? ORDER BY name ASC`,
      [wildCardName],
      (err, rows: Tag[]) => (err ? reject(err) : resolve(rows))
    )
  })
}

export function updateTag(db: Database, tag: Tag): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.run(`UPDATE tags SET name = ? WHERE id = ?`, [tag.name, tag.id], (err) =>
      err ? reject(err) : resolve()
    )
  })
}

export function insertTag(db: Database, tag: Tag): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    db.run(`INSERT INTO tags(name) VALUES(?)`, [tag.name], function (err) {
      if (err) {
        reject(err)
      }
      resolve(this.lastID)
    })
  })
}

export async function deleteTag(db: Database, id: number): Promise<void> {
  db.serialize(() => {
    db.run(`DELETE FROM tags WHERE id = ?`, [id], (err) => {
      if (err) {
        throw err
      }
    })
    db.run(`DELETE FROM tagsAndTransactions WHERE tagId = ?`, [id], (err) => {
      if (err) {
        throw err
      }
    })
  })

  await deleteTagRuleForTagId(db, id)
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
      (err) => (err ? reject(err) : resolve())
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
      (err) => (err ? reject(err) : resolve())
    )
  })
}

export function applyTagRulesToTransactions(db: Database, transactionIds: number[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const promiseBase = (transactionId: number): Promise<void> =>
      new Promise<void>((resolveBase) => {
        getTransaction(db, transactionId).then((transaction: Transaction) => {
          db.run(
            `
            INSERT INTO tagsAndTransactions (tagId, transactionId)
            SELECT tagRules.tagId, ?
            FROM tagRules
            WHERE INSTR(LOWER(?), LOWER(tagRules.ruleValue))`,
            [transaction.id, transaction.description],
            (err) => (err ? reject(err) : resolveBase())
          )
        })
      })

    Promise.all(transactionIds.map(promiseBase))
      .then(() => resolve())
      .catch(reject)
  })
}

export async function applyTagRuleToTransactions(db: Database, tagId: number): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    db.serialize(async () => {
      const tagRule: TagRule | undefined = await getTagRuleForTagId(db, tagId)

      if (!tagRule) {
        return resolve(0)
      }

      const insertPromises = tagRule.values.map(
        (value) =>
          new Promise<void>((resolveInsert) => {
            db.run(
              `
          INSERT OR IGNORE INTO tagsAndTransactions (tagId, transactionId)
          SELECT ?, t.id
          FROM transactions t 
          WHERE INSTR(LOWER(t.description), LOWER(?)) > 0`,
              [tagId, value],
              (err) => (err ? reject(err) : resolveInsert())
            )
          })
      )

      await Promise.all(insertPromises)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      db.get(`SELECT changes() AS count`, (err: Error, row: any) =>
        err ? reject(err) : resolve(row.count)
      )
    })
  })
}

export function getTagRuleForTagId(db: Database, tagId: number): Promise<TagRule | undefined> {
  return new Promise<TagRule | undefined>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.all(`SELECT * FROM tagRules WHERE tagId = ?`, [tagId], (err, rows: any[]) => {
      if (err) {
        reject(err)
      }
      if (rows) {
        resolve({ tagId: tagId, values: rows.map((row) => row.ruleValue) })
      }
      resolve(undefined)
    })
  })
}

export function insertTagRuleForTagId(
  db: Database,
  tagId: number,
  values: string[]
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const insertPromises = values.map(
      (value) =>
        new Promise<void>((resolveInsert) => {
          db.run(`INSERT INTO tagRules(tagId, ruleValue) VALUES (?, ?)`, [tagId, value], (err) =>
            err ? reject(err) : resolveInsert()
          )
        })
    )

    Promise.all(insertPromises)
      .then(() => resolve())
      .catch(reject)
  })
}

export function deleteTagRuleForTagId(db: Database, tagId: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.run(`DELETE FROM tagRules WHERE tagId = ?`, [tagId], (err) =>
      err ? reject(err) : resolve()
    )
  })
}
