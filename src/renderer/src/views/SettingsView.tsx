import Dropdown from '@renderer/components/Dropdown'
import Loader from '@renderer/components/Loader'
import { ErrorModal } from '@renderer/components/StatusModals'
import WidgetHeader from '@renderer/components/WidgetHeader'
import { BankType } from '@renderer/models/types'
import UserSettings from '@renderer/models/userSettings'
import { useEffect, useState } from 'react'

const SettingsView = (): JSX.Element => {
  const [userSettings, setUserSettings] = useState<UserSettings>()
  const [errorMsg, setErrorMsg] = useState<string>('')

  useEffect(() => {
    window.api
      .getUserSettings()
      .then((value) => setUserSettings(value))
      .catch((err: Error) => setErrorMsg(err.message))
  }, [])

  return userSettings !== undefined ? (
    <div className="widget-expanded">
      <WidgetHeader heading="Settings" />
      <table className="table">
        <tbody>
          <tr>
            <td>Bank Preference</td>
            <td>
              <Dropdown
                dropdownContent={userSettings?.bankPref}
                dropdownItems={Object.values(BankType).slice(1)}
                handleSelect={(value: string): void => {
                  setUserSettings((prev) => {
                    const newUserSettings = { ...prev, bankPref: value as BankType }
                    window.api.updateUserSettings(newUserSettings)
                    return newUserSettings
                  })
                }}
                className="w-64"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <ErrorModal contentText={errorMsg} handleClose={(): void => setErrorMsg('')} />
    </div>
  ) : (
    <Loader />
  )
}

export default SettingsView
