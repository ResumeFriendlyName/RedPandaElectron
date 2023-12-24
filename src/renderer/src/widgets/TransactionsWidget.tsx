import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate } from 'react-router-dom'

const TransactionsWidget = (): JSX.Element => {
  const navigate = useNavigate()
  return (
    <div className="widget">
      <div className="flex justify-between items-center">
        <h3>Recent transactions</h3>
        <button className="btn btn-sm" onClick={(): void => navigate('transactions')}>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
        </button>
        <table></table>
      </div>
    </div>
  )
}

export default TransactionsWidget
