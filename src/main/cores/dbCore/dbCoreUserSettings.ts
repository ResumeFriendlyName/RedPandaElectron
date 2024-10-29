import { Database } from 'sqlite3'
import UserSettings from '../../../renderer/src/models/userSettings'

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
    db.run(`UPDATE userSettings SET bankPref = ? WHERE id = 1`, [userSettings.bankPref], (err) =>
      err ? reject(err) : resolve()
    )
  )
}
