import Loader from '@renderer/components/common/Loader'
import { ErrorModal } from '@renderer/components/modals/StatusModals'
import WidgetHeader from '@renderer/components/common/WidgetHeader'
import UserSettings from '@renderer/models/userSettings'
import { useEffect, useState } from 'react'
import BankPrefDropdownAndInfo from '@renderer/components/dropdowns/BankPrefDropdownAndInfo'
import AllTags from '@renderer/components/dropdowns/AllTagsDropdownAndInfo'
import TagRuleDropdownAndInfo from '@renderer/components/dropdowns/TagRuleDropdownAndInfo'
import Tag from '@renderer/models/tag'

const SettingsView = (): JSX.Element => {
  const [userSettings, setUserSettings] = useState<UserSettings>()
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [tags, setTags] = useState<Tag[]>([])

  const handleError = (err: Error): void => setErrorMsg(err.message)

  const handleFetchTags = (): void => {
    window.api
      .getTags()
      .then(setTags)
      .catch((err: Error) => setErrorMsg(err.message))
  }

  const handleUserSettings = (value: UserSettings): void => {
    setUserSettings(value)
    setLoading(true)
    window.api
      .updateUserSettings(value)
      .catch((err: Error) => setErrorMsg(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // TODO: Is this loading actually doing anything?
    setLoading(true)
    window.api
      .getUserSettings()
      .then((value) => setUserSettings(value))
      .catch((err: Error) => setErrorMsg(err.message))
      .finally(() => setLoading(false))

    handleFetchTags()
  }, [])

  return (
    <div className="widget-expanded self-center w-full max-w-5xl min-w-fit">
      <WidgetHeader heading="Settings" notWidget />
      {userSettings !== undefined && (
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
            {/* Tags setting */}
            <tr>
              <td className="font-semibold select-none">Tags</td>
              <td>
                <AllTags tags={tags} handleFetchTags={handleFetchTags} handleError={handleError} />
              </td>
            </tr>
            {/* Auto tag setting */}
            <tr>
              <td className="font-semibold select-none">Auto Tag Rules</td>
              <td>
                <TagRuleDropdownAndInfo tags={tags} handleError={handleError} />
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <Loader open={loading} />
      <ErrorModal contentText={errorMsg} handleClose={(): void => setErrorMsg('')} />
    </div>
  )
}

export default SettingsView
