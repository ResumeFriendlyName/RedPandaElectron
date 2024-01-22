import Dropdown from '@renderer/components/Dropdown'
import InfoButton from '@renderer/components/InfoButton'
import Loader from '@renderer/components/Loader'
import { ErrorModal } from '@renderer/components/StatusModals'
import WidgetHeader from '@renderer/components/WidgetHeader'
import { BankType, ComponentSize } from '@renderer/models/types'
import UserSettings from '@renderer/models/userSettings'
import { useEffect, useState } from 'react'

const SettingsView = (): JSX.Element => {
  const [userSettings, setUserSettings] = useState<UserSettings>()
  const [errorMsg, setErrorMsg] = useState<string>('')
  const bankPrefInfo = (
    <table className="table mb-3 select-none">
      <colgroup>
        <col className="w-2/5" />
        <col className="w-3/5" />
      </colgroup>
      <tbody>
        <tr>
          <th className="text-start ">Bank Australia</th>
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
              <td className="flex gap-6 items-center">
                <Dropdown
                  dropdownContent={userSettings?.bankPref}
                  dropdownItems={Object.values(BankType).slice(1)}
                  size={ComponentSize.MD}
                  handleSelect={(value: string): void => {
                    setUserSettings((prev) => {
                      const newUserSettings = { ...prev, bankPref: value as BankType }
                      window.api
                        .updateUserSettings(newUserSettings)
                        .catch((err: Error) => setErrorMsg(err.message))
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
      ) : (
        <Loader />
      )}
      <ErrorModal contentText={errorMsg} handleClose={(): void => setErrorMsg('')} />
    </div>
  )
}

export default SettingsView
