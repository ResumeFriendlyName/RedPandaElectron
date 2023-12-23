import Transaction from '../../renderer/src/models/transaction'

export function translateBATransactions(transactions: string[]): Transaction[] {
  return transactions
    .flat()
    .filter((transaction) => !transaction[0].includes('Effective'))
    .map((transaction) => ({
      id: -1,
      date: new Date(transaction[1]),
      description: transaction[2],
      amount: Number(transaction[3]),
      balance: Number(transaction[4])
    }))
}
