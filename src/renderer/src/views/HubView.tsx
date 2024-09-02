import CashFlowWidget from '@renderer/widgets/CashFlowWidget'
import TransactionsWidget from '@renderer/widgets/TransactionsWidget'
import TagAmountsWidget from '@renderer/widgets/TagAmountsWidget'

const HubView = (): JSX.Element => {
  return (
    <div className="flex gap-3 flex-wrap">
      <TransactionsWidget />
      <CashFlowWidget />
      <TagAmountsWidget />
    </div>
  )
}

export default HubView
