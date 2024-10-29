import { BankType } from '@renderer/models/types'
import Modal from './Modal'
import { useEffect, useState } from 'react'

interface BankPreferenceModalProps {
  open: boolean
  handleSubmit: (value: BankType) => void
}

const BankPreferenceModal = (props: BankPreferenceModalProps): JSX.Element => {
  const [selectedBank, setSelectedBank] = useState<BankType>()
  const [bankInfo, setBankInfo] = useState<string>('')

  useEffect(() => {
    if (selectedBank == BankType.BANK_AUSTRALIA) {
      setBankInfo('Accepted bank statements will be in csv.')
    } else if (selectedBank == BankType.COMMONWEALTH_BANK) {
      setBankInfo('Accepted bank statements will be in csv.')
    }
  }, [selectedBank])

  return (
    <Modal open={props.open}>
      <div className="modal-content">
        <h3>Select your bank</h3>
        <div className="flex gap-5">
          {Object.values(BankType)
            .filter((bankType) => bankType !== BankType.UNSPECIFIED)
            .map((bankType) => (
              <button
                className={`btn w-40 h-40 ${selectedBank === bankType ? 'btn-submit' : ''}`}
                key={`bankPref_${bankType}`}
                onClick={(): void => setSelectedBank(bankType)}
              >
                <span>{bankType}</span>
              </button>
            ))}
        </div>
        <div className="min-h-[1.5rem]">
          <p>{bankInfo}</p>
        </div>
        <form method="dialog">
          <button
            className="btn btn-md"
            disabled={selectedBank === undefined}
            onClick={(e): void => {
              e.preventDefault()
              // Can guarantee not null due to disabled condition
              props.handleSubmit(selectedBank!)
            }}
          >
            <span>Save</span>
          </button>
        </form>
      </div>
    </Modal>
  )
}

export default BankPreferenceModal
