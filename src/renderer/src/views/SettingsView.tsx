import Dropdown from '@renderer/components/Dropdown'
import InfoButton from '@renderer/components/InfoButton'
import Loader from '@renderer/components/Loader'
import { ErrorModal } from '@renderer/components/StatusModals'
import WidgetHeader from '@renderer/components/WidgetHeader'
import { BankType } from '@renderer/models/types'
import UserSettings from '@renderer/models/userSettings'
import { useEffect, useState } from 'react'

const SettingsView = (): JSX.Element => {
  const [userSettings, setUserSettings] = useState<UserSettings>()
  const [errorMsg, setErrorMsg] = useState<string>('')
  const bankPrefInfo = (
    <table className="table mb-3">
      <colgroup>
        <col className="w-2/5" />
        <col className="w-3/5" />
      </colgroup>
      <tbody>
        <tr>
          <th className="text-start">Bank Australia</th>
          <td className="text-start">Accepted bank statements will be in csv.</td>
        </tr>
        <tr>
          <th className="text-start">Commonwealth Bank</th>
          <td className="text-start">Accepted bank statements will be in pdf.</td>
        </tr>
      </tbody>
    </table>
  )

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
        <colgroup>
          <col className="w-1/2" />
          <col className="w-1/2" />
        </colgroup>
        <tbody>
          <tr>
            <td>Bank Preference</td>
            <td className="flex gap-6 items-center">
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
              <InfoButton
                headingText={'Bank Selection Information'}
                content={bankPrefInfo}
                modalClassName="w-[40rem]"
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
