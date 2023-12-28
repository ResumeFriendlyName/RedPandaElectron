import { faFileImport, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getTransactions } from '@renderer/api/transactionsApi'
import BankPreferenceModal from '@renderer/components/BankPreferenceModal'
import { ErrorModal } from '@renderer/components/StatusModals'
import TablePagination from '@renderer/components/TablePagination'
import TransactionsTable from '@renderer/components/TransactionsTable'
import Transaction from '@renderer/models/transaction'
import TransactionResponse from '@renderer/models/transactionResponse'
import { BankType } from '@renderer/models/types'
import UserSettings from '@renderer/models/userSettings'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TransactionsView = (): JSX.Element => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionAmount, setTransactionAmount] = useState<number>(10)
  const [transactionCount, setTransactionCount] = useState<number>(0)
  const [offset, setOffset] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [userSettings, setUserSettings] = useState<UserSettings>()
  const [bankModalIsOpen, setBankModalOpen] = useState<boolean>(false)
  const navigate = useNavigate()

  const handleTransactionAmount = (value: number): void => {
    setTransactionAmount(value)
    setOffset(0)
  }
  const handleOffset = (value: number): void => setOffset(value)

  const handleBankModalSubmit = (value: BankType): void => {
    setBankModalOpen(false)
    setUserSettings((prev) => ({ ...prev, bankPref: value }))
    window.api.updateUserSettings({ bankPref: value }).then(() => importTransactions())
  }

  const handleErrorModalClose = (): void => setErrorMsg('')

  const importTransactions = (): void => {
    window.api
      .importTransactions()
      .then(() => getTransactionsCallback())
      .catch((err: Error) => setErrorMsg(err.message))
  }

  const getTransactionsCallback = useCallback(() => {
    getTransactions(offset, transactionAmount).then((response: TransactionResponse) => {
      setTransactions(response.transactions)
      setTransactionCount(response.count)
    })
  }, [transactionAmount, offset])

  useEffect(() => {
    window.api
      .getUserSettings()
      .then((response: UserSettings) => setUserSettings(response))
      .catch((err: Error) => setErrorMsg(err.message))
  }, [])
  useEffect(() => getTransactionsCallback(), [transactionAmount, offset])

  return (
    <div className="widget-expanded">
      <div className="widget-header">
        <h2>Transactions</h2>
        {/* Close transactions view button */}
        <button className="btn btn-sm" onClick={(): void => navigate('/')}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <div className="flex justify-between items-center">
        {transactionCount > 0 ? (
          <TablePagination
            offset={offset}
            amount={transactionAmount}
            count={transactionCount}
            handleOffset={handleOffset}
            handleAmount={handleTransactionAmount}
          />
        ) : (
          <div />
        )}
        {/* Import transactions button */}
        <button
          className="btn btn-md"
          onClick={(): void => {
            if (userSettings?.bankPref === BankType.UNSPECIFIED) {
              setBankModalOpen(true)
            } else {
              importTransactions()
            }
          }}
        >
          <FontAwesomeIcon icon={faFileImport} />
        </button>
      </div>
      <TransactionsTable transactions={transactions} />
      <ErrorModal contentText={errorMsg} handleClose={handleErrorModalClose} />
      <BankPreferenceModal open={bankModalIsOpen} handleSubmit={handleBankModalSubmit} />
    </div>
  )
}

export default TransactionsView
