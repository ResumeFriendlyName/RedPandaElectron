import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getTransactions } from '@renderer/api/transactionsApi'
import TransactionsTable from '@renderer/components/TransactionsTable'
import Transaction from '@renderer/models/transaction'
import TransactionResponse from '@renderer/models/transactionResponse'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TransactionsWidget = (): JSX.Element => {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    getTransactions(0, 5).then((response: TransactionResponse) =>
      setTransactions(response.transactions)
    )
  }, [])

  return (
    <div className="widget min-w-[25rem] max-w-lg">
      <div className="widget-header">
        <h3>Recent transactions</h3>
        <button className="btn btn-sm" onClick={(): void => navigate('transactions')}>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
        </button>
      </div>
      <TransactionsTable transactions={transactions} />
    </div>
  )
}

export default TransactionsWidget
