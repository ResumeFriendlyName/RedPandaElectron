import { faEye, faEyeSlash, faFileImport, faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Accordion from '@renderer/components/dropdowns/Accordion'
import BankPreferenceModal from '@renderer/components/modals/BankPreferenceModal'
import Loader from '@renderer/components/common/Loader'
import { ErrorModal, InfoModal } from '@renderer/components/modals/StatusModals'
import TablePagination from '@renderer/components/tables/TablePagination'
import TransactionsTable from '@renderer/components/tables/TransactionsTable'
import WidgetHeader from '@renderer/components/common/WidgetHeader'
import ImportTransactionResponse from '@renderer/models/importTransactionResponse'
import Tag from '@renderer/models/tag'
import Transaction from '@renderer/models/transaction'
import TransactionResponse from '@renderer/models/transactionResponse'
import TransactionWithTags from '@renderer/models/transactionWithTags'
import { BankType, SessionStorageKey } from '@renderer/models/types'
import UserSettings from '@renderer/models/userSettings'
import useSessionStorage from '@renderer/utils/CustomHooks'
import { useCallback, useEffect, useState } from 'react'

const TransactionsView = (): JSX.Element => {
  const [transactionsWithTags, setTransactions] = useState<TransactionWithTags[]>([])
  const [transactionAmount, setTransactionAmount] = useState<number>(10)
  const [transactionCount, setTransactionCount] = useState<number>(0)
  const [lastImportIds, setLastImportIds] = useSessionStorage<number[]>(
    SessionStorageKey.LAST_TRANSACTION_IMPORT_IDS
  )
  const [offset, setOffset] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [userSettings, setUserSettings] = useState<UserSettings>()
  const [bankModalIsOpen, setBankModalOpen] = useState<boolean>(false)
  const [dupeModalIsOpen, setDupeModalOpen] = useState<boolean>(false)
  const [dupeTransactions, setDupeTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [hideTags, setHideTags] = useState<boolean>(true)

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
    setLoading(true)
    window.api
      .importTransactions()
      .then((response: ImportTransactionResponse) => {
        setLastImportIds(response.transactionIds)
        if (response.dupeTransactions.length) {
          setDupeModalOpen(true)
          setDupeTransactions(response.dupeTransactions)
        } else {
          getTransactions()
        }
      })
      .catch((err: Error) => setErrorMsg(err.message))
      .finally(() => setLoading(false))
  }
  const deleteTransactions = (ids: number[]): void => {
    setLoading(true)
    window.api
      .deleteTransactions(ids)
      .then(() => {
        setLastImportIds([])
        getTransactions()
      })
      .catch((err: Error) => setErrorMsg(err.message))
      .finally(() => setLoading(false))
  }
  const deleteTagWithTransaction = (tagId: number, transactionId: number): void => {
    setLoading(true)
    window.api
      .deleteTagWithTransaction(tagId, transactionId)
      .then(() => getTransactions())
      .catch((err: Error) => setErrorMsg(err.message))
      .finally(() => setLoading(false))
  }

  const handleTagAddToTransaction = (tag: Tag, transaction: Transaction): void => {
    setLoading(true)
    window.api
      .insertTagWithTransaction(tag, transaction)
      .then(() => getTransactions())
      .catch((err: Error) => setErrorMsg(err.message))
      .finally(() => setLoading(false))
  }

  const getTransactions = useCallback(() => {
    setLoading(true)
    window.api
      .getTransactions(transactionAmount, offset)
      .then((response: TransactionResponse) => {
        setTransactions(response.transactionsWithTags)
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
  useEffect(() => getTransactions(), [transactionAmount, offset])

  return (
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
          {/* Undo last import button */}
          {lastImportIds.length > 0 && (
            <button className="btn btn-md" onClick={(): void => deleteTransactions(lastImportIds)}>
              <FontAwesomeIcon icon={faRotateLeft} />{' '}
            </button>
          )}
          {/* Show/hide tags button */}
          <button className="btn btn-md" onClick={(): void => setHideTags((prev) => !prev)}>
            <FontAwesomeIcon icon={hideTags ? faEyeSlash : faEye} />
          </button>
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
      {!loading ? (
        <TransactionsTable
          hideTags={hideTags}
          transactionsWithTags={transactionsWithTags}
          handleTagDeleteWithTransaction={deleteTagWithTransaction}
          handleTagAddToTransaction={handleTagAddToTransaction}
        />
      ) : (
        <Loader />
      )}
      <BankPreferenceModal open={bankModalIsOpen} handleSubmit={handleBankModalSubmit} />
      <InfoModal
        open={dupeModalIsOpen}
        headingText="Duplicate Transactions"
        content={
          <Accordion
            summary={`${lastImportIds.length} unique transaction${
              lastImportIds.length == 1 ? ' was' : 's were'
            }  imported, ${dupeTransactions.length} duplicate${
              dupeTransactions.length == 1 ? ' was' : 's were'
            }  not. Expand to see duplicates`}
            content={
              <table className="table table-last-borderless">
                <tbody className="[td]:last:border-b-0">
                  {dupeTransactions.map((transaction, index) => (
                    <tr key={`dupe_trans_${index}`}>
                      <td>{transaction.date}</td>
                      <td>{transaction.description}</td>
                      <td>{transaction.amount}</td>
                      <td>{transaction.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          />
        }
        handleClose={(): void => {
          setDupeModalOpen(false)
          setDupeTransactions([])
        }}
      />
      <ErrorModal contentText={errorMsg} handleClose={(): void => setErrorMsg('')} />
    </div>
  )
}

export default TransactionsView
