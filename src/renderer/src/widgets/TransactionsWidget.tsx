import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getTransactions } from '@renderer/api/transactionsApi'
import Loader from '@renderer/components/Loader'
import { ErrorModal } from '@renderer/components/StatusModals'
import TransactionsTable from '@renderer/components/TransactionsTable'
import Transaction from '@renderer/models/transaction'
import TransactionResponse from '@renderer/models/transactionResponse'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TransactionsWidget = (): JSX.Element => {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    setLoading(true)
    getTransactions(0, 5)
      .then((response: TransactionResponse) => setTransactions(response.transactions))
      .catch((err: Error) => setErrorMsg(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      {!loading ? (
        <div className="widget min-w-[25rem] max-w-lg">
          <div className="widget-header">
            <h3>Recent transactions</h3>
            <button className="btn btn-sm" onClick={(): void => navigate('transactions')}>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </button>
          </div>
          <TransactionsTable transactions={transactions} />
        </div>
      ) : (
        <Loader />
      )}
      <ErrorModal contentText={errorMsg} handleClose={(): void => setErrorMsg('')} />
    </>
  )
}

export default TransactionsWidget
