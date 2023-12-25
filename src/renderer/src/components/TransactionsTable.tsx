import Transaction from '@renderer/models/transaction'

interface TransactionsTableProps {
  transactions: Transaction[]
}

const TransactionsTable = (props: TransactionsTableProps): JSX.Element => {
  return (
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
            <td>{transaction.amount}</td>
            <td>{transaction.balance}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default TransactionsTable
