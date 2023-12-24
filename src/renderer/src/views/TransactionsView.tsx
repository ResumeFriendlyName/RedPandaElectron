import { faFileImport, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TablePagination from '@renderer/components/TablePagination'
import TransactionsTable from '@renderer/components/TransactionsTable'
import Transaction from '@renderer/models/transaction'
import TransactionResponse from '@renderer/models/transactionResponse'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TransactionsView = (): JSX.Element => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionAmount, setTransactionAmount] = useState<number>(10)
  const [transactionCount, setTransactionCount] = useState<number>(0)
  const [offset, setOffset] = useState<number>(0)
  const navigate = useNavigate()

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
    <div className="widget-expanded">
      <div className="flex justify-between items-center">
        <h2>Transactions</h2>
        <button className="btn btn-sm" onClick={(): void => navigate('/')}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

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
    </div>
  )
}

export default TransactionsView
