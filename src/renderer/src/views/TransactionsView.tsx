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
      <button
        onClick={(): void => {
          window.api
            .importTransactions()
            .then((errMsg) => {
              if (errMsg) {
                console.error(errMsg)
              } else {
                // window.api.getTransactions(transactionAmount, offset).then(setTransactions)
                getTransactions()
              }
            })
            .catch((err) => {
              console.error(err)
            })
        }}
      >
        Import transactions
      </button>
      <TablePagination
        offset={offset}
        amount={transactionAmount}
        count={transactionCount}
        handleOffset={handleOffset}
        handleAmount={handleTransactionAmount}
      />
      <TransactionsTable transactions={transactions} />
    </>
  )
}

export default TransactionsView
