import Tag from './tag'
import Transaction from './transaction'

export default interface TransactionWithTags {
  transaction: Transaction
  tags: Tag[]
}
