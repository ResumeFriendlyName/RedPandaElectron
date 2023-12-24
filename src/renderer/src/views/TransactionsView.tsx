import { faFileImport } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TablePagination from '@renderer/components/TablePagination'
import TransactionsTable from '@renderer/components/TransactionsTable'
import Transaction from '@renderer/models/transaction'
import TransactionResponse from '@renderer/models/transactionResponse'
import { useCallback, useEffect, useState } from 'react'

const TransactionsView = (): JSX.Element => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionAmount, setTransactionAmount] = useState<number>(10)
  const [transactionCount, setTransactionCount] = useState<number>(0)
  const [offset, setOffset] = useState<number>(0)

  const handleTransactionAmount = (value: number): void => {
    setTransactionAmount(value)
    setOffset(0)
  }
  const handleOffset = (value: number): void => setOffset(value)

  const getTransactions = useCallback(() => {
    window.api
      .getTransactions(transactionAmount, offset * transactionAmount)
      .then((response: TransactionResponse) => {
        setTransactions(response.transactions)
        setTransactionCount(response.count)
      })
      .catch((err) => console.error(err))
  }, [transactionAmount, offset])

  useEffect(() => getTransactions(), [transactionAmount, offset])

  return (
    <>
      <h1>Transactions</h1>
      <div className="flex justify-between items-center">
        <TablePagination
          offset={offset}
          amount={transactionAmount}
          count={transactionCount}
          handleOffset={handleOffset}
          handleAmount={handleTransactionAmount}
        />
        <button
          className="btn btn-md"
          onClick={(): void => {
            window.api
              .importTransactions()
              .then((errMsg) => {
                if (errMsg) {
                  console.error(errMsg)
                } else {
                  getTransactions()
                }
              })
              .catch((err) => {
                console.error(err)
              })
          }}
        >
          <FontAwesomeIcon icon={faFileImport} />
        </button>
      </div>
      <TransactionsTable transactions={transactions} />
    </>
  )
}

export default TransactionsView
