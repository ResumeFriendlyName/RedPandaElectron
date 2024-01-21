import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TagC from './Tag'
import TransactionWithTags from '@renderer/models/transactionWithTags'
import { Fragment } from 'react'

interface TransactionsTableProps {
  transactionsWithTags: TransactionWithTags[]
  hideTags?: boolean
  handleTagDelete: (tagId: number) => void
}

const TransactionsTable = (props: TransactionsTableProps): JSX.Element => {
  return props.transactionsWithTags.length ? (
    <>
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
          {props.transactionsWithTags.map((transactionWithTag) => (
            <Fragment key={`transaction_${transactionWithTag.transaction.id}`}>
              <tr>
                <td>{transactionWithTag.transaction.date}</td>
                <td>{transactionWithTag.transaction.description}</td>
                <td>{transactionWithTag.transaction.amount.toLocaleString()}</td>
                <td>{transactionWithTag.transaction.balance.toLocaleString()}</td>
              </tr>
              {!props.hideTags && (
                <tr>
                  <td colSpan={4}>
                    <div className="flex justify-start gap-3">
                      <button className="btn btn-sm">
                        <span>+ Add tag</span>
                      </button>
                      {transactionWithTag.tags.map((tag) => (
                        <TagC
                          key={`td_${transactionWithTag.transaction.id}_${tag.id}_${tag.name}`}
                          text={tag.name}
                          onDelete={(): void => props.handleTagDelete(tag.id)}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </>
  ) : (
    <div className="info">
      <FontAwesomeIcon icon={faCircleInfo} className="mr-1" />
      <span>No transactions available</span>
    </div>
  )
}

export default TransactionsTable
