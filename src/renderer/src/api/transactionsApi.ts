import Transaction from '@renderer/models/transaction'
import TransactionResponse from '@renderer/models/transactionResponse'

async function getTransactions(offset: number, amount: number): Promise<TransactionResponse> {
  let transactions: Transaction[] = []
  let count = 0

  await window.api
    .getTransactions(amount, offset * amount)
    .then((response: TransactionResponse) => {
      transactions = response.transactions
      count = response.count
    })
    .catch((err) => console.error(err))

  return { transactions, count }
}

export { getTransactions }
