import { ErrorModal } from '@renderer/components/modals/StatusModals'
import CashFlow from '@renderer/models/cashflow'
import { useEffect, useState } from 'react'

const CashFlowWidget = (): JSX.Element => {
  const [cashFlow, setCashFlow] = useState<CashFlow | undefined>()
  const [errorMsg, setErrorMsg] = useState<string>('')

  useEffect(() => {
    const currentDate: string = new Date().toLocaleDateString()
    window.api
      .getCashFlow('01/01/1900', currentDate)
      .then(setCashFlow)
      .catch((err: Error) => setErrorMsg(err.message))
  }, [])

  return (
    <div className="widget min-w-[25rem] max-w-lg">
      <div className="widget-header">
        <h3>Cash Flow</h3>
      </div>
      {cashFlow !== undefined ? (
        <table className="table table-hover w-full text-primary-content">
          <thead>
            <tr>
              <th>Gross Income</th>
              <th>Gross Expenses</th>
              <th>Net Income</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{cashFlow.grossIncome.toFixed(2)}</td>
              <td>{cashFlow.grossExpenses.toFixed(2)}</td>
              <td>{cashFlow.netIncome.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <></>
      )}
      <ErrorModal contentText={errorMsg} handleClose={(): void => setErrorMsg('')} />
    </div>
  )
}

export default CashFlowWidget
