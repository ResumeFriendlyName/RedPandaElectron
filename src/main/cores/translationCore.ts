import Transaction from '../../renderer/src/models/transaction'

export function translateBATransactions(transactions: string[]): Transaction[] {
  return transactions
    .flat()
    .filter((transaction) => !transaction[0].includes('Effective') && transaction.length != 1)
    .map((transaction) => ({
      id: -1,
      date: transaction[1],
      description: transaction[2],
      amount: Number(transaction[3]),
      balance: Number(transaction[4])
    }))
}
