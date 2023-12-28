import { useEffect, useState } from 'react'
import Dropdown from './Dropdown'

interface TablePaginationProps {
  offset: number
  amount: number
  count: number
  handleOffset: (value: number) => void
  handleAmount: (value: number) => void
}

const TablePagination = (props: TablePaginationProps): JSX.Element => {
  const [pageCount, setPageCount] = useState<number>(1)

  useEffect(
    () => setPageCount(Math.max(Math.ceil(props.count / props.amount), 1)),
    [props.count, props.amount]
  )

  return (
    <div className="inline-block">
      <button
        className="btn btn-md"
        onClick={(): void => props.handleOffset(props.offset - 1)}
        disabled={props.offset === 0}
      >
        «
      </button>
      <Dropdown
        dropdownContent={`Page ${props.offset + 1} of ${pageCount} (${props.amount})`}
        dropdownItems={['5', '10', '25', '50', '100']}
        handleSelect={(value: string): void => props.handleAmount(Number(value))}
      />
      <button
        className="btn btn-md"
        onClick={(): void => props.handleOffset(props.offset + 1)}
        disabled={(props.offset + 1) * props.amount >= props.count}
      >
        »
      </button>
    </div>
  )
}

export default TablePagination
