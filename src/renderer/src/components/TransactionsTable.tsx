import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TagC from './Tag'
import TransactionWithTags from '@renderer/models/transactionWithTags'

interface TransactionsTableProps {
  transactions: TransactionWithTags[]
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
            <tr key={`tr_${transaction.transaction.id}`}>
              <td>{transaction.transaction.date}</td>
              <td>{transaction.transaction.description}</td>
              <td>{transaction.transaction.amount.toLocaleString()}</td>
              <td>{transaction.transaction.balance.toLocaleString()}</td>
            </tr>
            <tr>
              <td colSpan={4}>
                <div className="flex justify-start gap-3">
                  <button className="btn">
                    <span>+ Add tag</span>
                  </button>
                  {transaction.tags.map((tag) => (
                    <TagC key={`td_${transaction.transaction.id}_${tag.id}`} text={tag.name} />
                  ))}
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
