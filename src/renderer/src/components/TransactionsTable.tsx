import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Transaction from '@renderer/models/transaction'

interface TransactionsTableProps {
  transactions: Transaction[]
}

const TransactionsTable = (props: TransactionsTableProps): JSX.Element => {
  return props.transactions.length ? (
    <table className="table w-full text-primary-content">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        {props.transactions.map((transaction) => (
          <tr key={`tr_${transaction.id}`}>
            <td>{transaction.date}</td>
            <td>{transaction.description}</td>
            <td>{transaction.amount.toLocaleString()}</td>
            <td>{transaction.balance.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <div className="info">
      <FontAwesomeIcon icon={faCircleInfo} className="mr-1" />
      <span>No transactions available</span>
    </div>
  )
}

export default TransactionsTable
