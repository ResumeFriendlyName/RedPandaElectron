import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Loader from '@renderer/components/common/Loader'
import { ErrorModal } from '@renderer/components/modals/StatusModals'
import TransactionsTable from '@renderer/components/tables/TransactionsTable'
import TransactionResponse from '@renderer/models/transactionResponse'
import TransactionWithTags from '@renderer/models/transactionWithTags'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TransactionsWidget = (): JSX.Element => {
  const navigate = useNavigate()
  const [transactionsWithTags, setTransactions] = useState<TransactionWithTags[]>([])
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    setLoading(true)
    window.api
      .getTransactions(5, 0)
      .then((response: TransactionResponse) => setTransactions(response.transactionsWithTags))
      .catch((err: Error) => setErrorMsg(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="widget min-w-[25rem] max-w-xl">
      <div className="widget-header">
        <h3>Recent Transactions</h3>
        <button className="btn btn-sm" onClick={(): void => navigate('transactions')}>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
        </button>
      </div>

      <TransactionsTable
        transactionsWithTags={transactionsWithTags}
        hideTags
        handleTagAddToTransaction={(): void => {}}
        handleTagDeleteWithTransaction={(): void => {}}
      />

      <Loader open={loading} />
      <ErrorModal contentText={errorMsg} handleClose={(): void => setErrorMsg('')} />
    </div>
  )
}

export default TransactionsWidget
