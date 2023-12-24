import Transaction from './transaction'

export default interface TransactionResponse {
  transactions: Transaction[]
  count: number
}
