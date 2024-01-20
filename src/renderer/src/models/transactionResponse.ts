import TransactionWithTags from './transactionWithTags'

export default interface TransactionResponse {
  transactionsWithTags: TransactionWithTags[]
  count: number
}
