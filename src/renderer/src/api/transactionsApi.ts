import TransactionResponse from '@renderer/models/transactionResponse'

async function getTransactions(offset: number, amount: number): Promise<TransactionResponse> {
  return new Promise<TransactionResponse>((resolve, reject) => {
    window.api
      .getTransactions(amount, offset * amount)
      .then((response: TransactionResponse) => resolve(response))
      .catch((err) => reject(err))
  })
}

export { getTransactions }
