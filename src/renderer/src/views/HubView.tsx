import CashFlowWidget from '@renderer/widgets/CashFlowWidget'
import TransactionsWidget from '@renderer/widgets/TransactionsWidget'

const HubView = (): JSX.Element => {
  return (
    <>
      <TransactionsWidget />
      <CashFlowWidget />
    </>
  )
}

export default HubView
