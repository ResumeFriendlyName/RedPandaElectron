import { faFileImport, faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getTransactions } from '@renderer/api/transactionsApi'
import BankPreferenceModal from '@renderer/components/BankPreferenceModal'
import Loader from '@renderer/components/Loader'
import { ErrorModal } from '@renderer/components/StatusModals'
import TablePagination from '@renderer/components/TablePagination'
import TransactionsTable from '@renderer/components/TransactionsTable'
import WidgetHeader from '@renderer/components/WidgetHeader'
import Transaction from '@renderer/models/transaction'
import TransactionResponse from '@renderer/models/transactionResponse'
import { BankType } from '@renderer/models/types'
import UserSettings from '@renderer/models/userSettings'
import { useCallback, useEffect, useState } from 'react'

const TransactionsView = (): JSX.Element => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionAmount, setTransactionAmount] = useState<number>(10)
  const [transactionCount, setTransactionCount] = useState<number>(0)
  const [lastImportIds, setLastImportIds] = useState<number[]>([])
  const [offset, setOffset] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [userSettings, setUserSettings] = useState<UserSettings>()
  const [bankModalIsOpen, setBankModalOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  const handleTransactionAmount = (value: number): void => {
    setTransactionAmount(value)
    setOffset(0)
  }
  const handleOffset = (value: number): void => setOffset(value)

  const handleBankModalSubmit = (value: BankType): void => {
    setBankModalOpen(false)
    setUserSettings((prev) => ({ ...prev, bankPref: value }))
    window.api
      .updateUserSettings({ bankPref: value })
      .then(() => importTransactions())
      .catch((err: Error) => setErrorMsg(err.message))
  }

  const importTransactions = (): void => {
    window.api
      .importTransactions()
      .then((ids: number[]) => {
        setLastImportIds(ids)
        getTransactionsCallback()
      })
      .catch((err: Error) => setErrorMsg(err.message))
  }

  const getTransactionsCallback = useCallback(() => {
    setLoading(true)
    getTransactions(offset, transactionAmount)
      .then((response: TransactionResponse) => {
        setTransactions(response.transactions)
        setTransactionCount(response.count)
      })
      .catch((err: Error) => setErrorMsg(err.message))
      .finally(() => setLoading(false))
  }, [transactionAmount, offset])

  useEffect(() => {
    setLoading(true)
    window.api
      .getUserSettings()
      .then((response: UserSettings) => setUserSettings(response))
      .catch((err: Error) => setErrorMsg(err.message))
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => getTransactionsCallback(), [transactionAmount, offset])

  return (
    <>
      {!loading ? (
        <div className="widget-expanded">
          <WidgetHeader heading="Transactions" />

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
            <div className="flex gap-6">
              {lastImportIds.length > 0 && (
                <button
                  className="btn btn-md"
                  onClick={(): void => {
                    setLoading(true)
                    window.api
                      .deleteTransactions(lastImportIds)
                      .then(() => setLastImportIds([]))
                      .catch((err: Error) => setErrorMsg(err.message))
                      .finally(() => setLoading(false))
                  }}
                >
                  <FontAwesomeIcon icon={faRotateLeft} />{' '}
                </button>
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
          </div>
          <TransactionsTable transactions={transactions} />
          <BankPreferenceModal open={bankModalIsOpen} handleSubmit={handleBankModalSubmit} />
        </div>
      ) : (
        <Loader />
      )}
      <ErrorModal contentText={errorMsg} handleClose={(): void => setErrorMsg('')} />
    </>
  )
}

export default TransactionsView
