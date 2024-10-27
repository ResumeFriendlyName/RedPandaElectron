import { Database, RunResult } from 'sqlite3'
import Tag from '../../../renderer/src/models/tag'
import Transaction from '../../../renderer/src/models/transaction'
import TransactionWithTags from '../../../renderer/src/models/transactionWithTags'
import TagAmount from '../../../renderer/src/models/tagAmount'
import TagRule from '../../../renderer/src/models/tagRule'

const tagRuleDelimiter = '$redPandaTagRuleDelimiter$'

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
    db.run(`UPDATE tags SET name = ? WHERE id = ?`, [tag.name, tag.id], (_, err: Error) =>
      err ? reject(err) : resolve()
    )
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

export async function deleteTag(db: Database, id: number): Promise<void> {
  db.serialize(() => {
    db.run(`DELETE FROM tags WHERE id = ?`, [id], (_, error: Error) => {
      if (error) {
        throw error
      }
    })
    db.run(`DELETE FROM tagsAndTransactions WHERE tagId = ?`, [id], (_, error: Error) => {
      if (error) {
        throw error
      }
    })
  })

  await deleteTagRulesForTagId(db, id)
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
      (_, err: Error) => (err ? reject(err) : resolve())
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
      (_, err: Error) => (err ? reject(err) : resolve())
    )
  })
}

export async function applyTagRuleToTransactions(db: Database, id: number): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    db.serialize(async () => {
      const tagRule = await getTagRule(db, id)
      const tag = await getTag(db, tagRule.tagId)

      const promiseBase = (ruleValue: string): Promise<void> =>
        new Promise<void>((resolveBase) => {
          db.run(
            `
            INSERT OR IGNORE INTO tagsAndTransactions (tagId, transactionId)
            SELECT ?, t.id
            FROM transactions t 
            WHERE INSTR(LOWER(?), LOWER(t.description)) > 0`,
            [tag.id, ruleValue],
            (_, err: Error) => (err ? reject(err) : resolveBase())
          )
        })

      await Promise.all(tagRule.values.map(promiseBase))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      db.get(`SELECT changes() AS count`, (err: Error, row: any) =>
        err ? reject(err) : resolve(row.count)
      )
    })
  })
}

export function getTagRule(db: Database, id: number): Promise<TagRule> {
  return new Promise<TagRule>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.get(`SELECT * FROM tagRules WHERE id = ?`, [id], (err, row: any) =>
      err
        ? reject(err)
        : resolve({
            id: row.id,
            tagId: row.tagId,
            values: row.rule_values.split(tagRuleDelimiter)
          })
    )
  })
}

export function getTagRuleForTagId(db: Database, tagId: number): Promise<TagRule | undefined> {
  return new Promise<TagRule | undefined>((resolve, reject) => {
    // Need this to transform rule_values name to values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.get(`SELECT * FROM tagRules WHERE tagId = ?`, [tagId], (err, row: any | undefined) => {
      if (err) {
        reject(err)
      }
      if (row) {
        resolve({ id: row.id, tagId: row.tagId, values: row.rule_values.split(tagRuleDelimiter) })
      }
      resolve(undefined)
    })
  })
}

export function updateTagRule(db: Database, id: number, values: string[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const merged_values = values.join(tagRuleDelimiter)
    db.run(`UPDATE tagRules SET rule_values = ? WHERE id = ?`, [merged_values, id], (err) =>
      err ? reject(err) : resolve()
    )
  })
}

export function insertTagRule(db: Database, tagId: number, values: string[]): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const merged_values = values.join(tagRuleDelimiter)
    db.run(
      `INSERT INTO tagRules(tagId, rule_values) VALUES(?, ?)`,
      [tagId, merged_values],
      function (this: RunResult, err: Error) {
        if (err) {
          reject(err)
        }
        resolve(this.lastID)
      }
    )
  })
}

export function deleteTagRulesForTagId(db: Database, tagId: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.run(`DELETE FROM tagRules WHERE tagId = ?`, [tagId], (_, err: Error) =>
      err ? reject(err) : resolve()
    )
  })
}

export function deleteTagRule(db: Database, id: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.run(`DELETE FROM tagRules WHERE id = ?`, [id], (_, err: Error) =>
      err ? reject(err) : resolve()
    )
  })
}
