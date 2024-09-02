import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TagChip from '../TagChip'
import TransactionWithTags from '@renderer/models/transactionWithTags'
import { Fragment } from 'react'
import AddTagButton from '../dropdowns/AddTagDropdown'
import Tag from '@renderer/models/tag'
import Transaction from '@renderer/models/transaction'

interface TransactionsTableProps {
  transactionsWithTags: TransactionWithTags[]
  hideTags?: boolean
  handleTagAddToTransaction: (tag: Tag, transaction: Transaction) => void
  handleTagDeleteWithTransaction: (tagId: number, transactionId: number) => void
}

const TransactionsTable = (props: TransactionsTableProps): JSX.Element => {
  return props.transactionsWithTags.length ? (
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
              <td className="whitespace-nowrap">{transactionWithTag.transaction.date}</td>
              <td>{transactionWithTag.transaction.description}</td>
              <td>{transactionWithTag.transaction.amount.toLocaleString()}</td>
              <td>{transactionWithTag.transaction.balance.toLocaleString()}</td>
            </tr>
            {!props.hideTags && (
              <tr className="hover:!bg-primary">
                <td colSpan={4}>
                  <div className="flex justify-start gap-3 flex-wrap">
                    <AddTagButton
                      transactionWithTags={transactionWithTag}
                      handleSelect={(tag: Tag): void =>
                        props.handleTagAddToTransaction(tag, transactionWithTag.transaction)
                      }
                    />
                    {transactionWithTag.tags.map((tag) => (
                      <TagChip
                        key={`td_${transactionWithTag.transaction.id}_${tag.id}_${tag.name}`}
                        text={tag.name}
                        onDelete={(): void =>
                          props.handleTagDeleteWithTransaction(
                            tag.id,
                            transactionWithTag.transaction.id
                          )
                        }
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
  ) : (
    <div className="info">
      <FontAwesomeIcon icon={faCircleInfo} className="mr-1" />
      <span>No transactions available</span>
    </div>
  )
}

export default TransactionsTable
