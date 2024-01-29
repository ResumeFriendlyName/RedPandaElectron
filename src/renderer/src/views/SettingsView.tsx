import Loader from '@renderer/components/common/Loader'
import { ErrorModal } from '@renderer/components/modals/StatusModals'
import WidgetHeader from '@renderer/components/common/WidgetHeader'
import UserSettings from '@renderer/models/userSettings'
import { useEffect, useState } from 'react'
import BankPrefDropdownAndInfo from '@renderer/components/dropdowns/BankPrefDropdownAndInfo'
import AllTags from '@renderer/components/AllTags'

const SettingsView = (): JSX.Element => {
  const [userSettings, setUserSettings] = useState<UserSettings>()
  const [errorMsg, setErrorMsg] = useState<string>('')

  const handleUserSettings = (value: UserSettings): void => {
    setUserSettings(value)
    window.api.updateUserSettings(value).catch((err: Error) => setErrorMsg(err.message))
  }

  useEffect(() => {
    window.api
      .getUserSettings()
      .then((value) => setUserSettings(value))
      .catch((err: Error) => setErrorMsg(err.message))
  }, [])

  return (
    <div className="widget-expanded self-center w-full max-w-5xl min-w-fit">
      <WidgetHeader heading="Settings" notWidget />
      {userSettings !== undefined ? (
        <table className="table">
          <colgroup>
            <col className="w-1/2" />
            <col className="w-1/2" />
          </colgroup>
          <tbody>
            {/* Bank preference setting */}
            <tr>
              <td className="font-semibold select-none">Bank Preference</td>
              <td>
                <BankPrefDropdownAndInfo
                  userSettings={userSettings}
                  handleUserSettings={handleUserSettings}
                />
              </td>
            </tr>
            <tr>
              <td className="font-semibold select-none">Tags</td>
              <td>
                <AllTags handleErrorMessage={(value): void => setErrorMsg(value)} />
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <Loader />
      )}
      <ErrorModal contentText={errorMsg} handleClose={(): void => setErrorMsg('')} />
    </div>
  )
}

export default SettingsView
