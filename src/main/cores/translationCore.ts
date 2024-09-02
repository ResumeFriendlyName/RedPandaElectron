import Transaction from '../../renderer/src/models/transaction'

export function translateBATransactions(transactions: string[]): Transaction[] {
  return transactions
    .flat()
    .filter((transaction) => !transaction[0].includes('Effective') && transaction.length != 1)
    .map((transaction) => {
      const [day, month, year] = transaction[1].split('/').map(Number)
      // ISOString format (without Time)
      const date = `${year}-${month}-${day}`
      return {
        id: -1,
        date: date,
        description: transaction[2],
        amount: Number(transaction[3]),
        balance: Number(transaction[4])
      }
    })
}
