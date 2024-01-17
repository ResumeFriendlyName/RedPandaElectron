import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Transaction from '@renderer/models/transaction'
import Tag from './Tag'

interface TransactionsTableProps {
  transactions: Transaction[]
}

const TransactionsTable = (props: TransactionsTableProps): JSX.Element => {
  return props.transactions.length ? (
    <table className="table table-hover w-full text-primary-content">
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
          <>
            <tr key={`tr_${transaction.id}`}>
              <td>{transaction.date}</td>
              <td>{transaction.description}</td>
              <td>{transaction.amount.toLocaleString()}</td>
              <td>{transaction.balance.toLocaleString()}</td>
            </tr>
            <tr>
              <td colSpan={4}>
                <div className="flex justify-start gap-3">
                  <button className="btn">
                    <span>+ Add tag</span>
                  </button>
                  <Tag text={'Test tag'} />
                  <Tag text={'Test tag'} />
                </div>
              </td>
            </tr>
          </>
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
