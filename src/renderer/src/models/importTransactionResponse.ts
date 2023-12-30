import Transaction from './transaction'

export default interface ImportTransactionResponse {
  transactionIds: number[]
  dupeTransactions: Transaction[]
}
