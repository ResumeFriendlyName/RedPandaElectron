import { BankType, ComponentSize } from '@renderer/models/types'
import Dropdown from './Dropdown'
import UserSettings from '@renderer/models/userSettings'
import InfoButton from '../buttons/InfoButton'

interface BankPrefDropdownProps {
  userSettings: UserSettings
  handleUserSettings: (value: UserSettings) => void
}

const BankPrefDropdownAndInfo = (props: BankPrefDropdownProps): JSX.Element => {
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
          <td className="text-start">Accepted bank statements will be in csv.</td>
        </tr>
      </tbody>
    </table>
  )

  return (
    <div className="flex gap-6 items-center">
      <Dropdown
        dropdownContent={props.userSettings.bankPref}
        dropdownItems={Object.values(BankType).slice(1)}
        size={ComponentSize.MD}
        handleSelect={(value: string): void =>
          props.handleUserSettings({ ...props.userSettings, bankPref: value as BankType })
        }
        className="w-64"
      />
      <InfoButton
        headingText={'Bank Selection Information'}
        content={bankPrefInfo}
        modalClassName="w-[40rem]"
      />
    </div>
  )
}

export default BankPrefDropdownAndInfo
