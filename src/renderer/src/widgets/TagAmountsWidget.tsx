import { ErrorModal } from '@renderer/components/modals/StatusModals'
import TagAmount from '@renderer/models/tagAmount'
import { useEffect, useState } from 'react'

const TagAmountsWidget = (): JSX.Element => {
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [tagAmounts, setTagAmounts] = useState<TagAmount[]>()

  useEffect(() => {
    const currentDate: string = new Date().toISOString()
    window.api
      .getTagAmounts('1900-01-01', currentDate)
      .then((response) =>
        setTagAmounts(
          response.filter((tagAmount) => tagAmount.amount < 0).sort((a, b) => a.amount - b.amount)
        )
      )
      .catch((error: Error) => setErrorMsg(error.message))
  }, [])

  return (
    <div className="widget min-w-[25rem] max-w-lg">
      <div className="widget-header">
        <h3>Most Expensive Tags</h3>
      </div>
      <div>
        <table className="table table-hover w-full text-primary-content">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {tagAmounts !== undefined &&
              tagAmounts.map((tagAmount) => (
                <tr key={`tagAmount_${tagAmount.tag.id}`}>
                  <td>{tagAmount.tag.name}</td>
                  <td>{tagAmount.amount.toFixed(2)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <ErrorModal contentText={errorMsg} handleClose={(): void => setErrorMsg('')} />
    </div>
  )
}

export default TagAmountsWidget
