import { useState } from 'react'

interface TablePaginationProps {
  offset: number
  amount: number
  count: number
  handleOffset: (value: number) => void
  handleAmount: (value: number) => void
}

const TablePagination = (props: TablePaginationProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false)
  let pageCount = 1

  if (props.count > 0) {
    pageCount = Math.max(Math.round(props.count / props.amount), 1)
  }

  return (
    <div className="inline-block">
      <button
        className="btn btn-md"
        onClick={(): void => props.handleOffset(props.offset - 1)}
        disabled={props.offset === 0}
      >
        «
      </button>

      <details
        className="dropdown"
        open={open}
        onClick={(e): void => {
          e.preventDefault()
          setOpen((prev) => !prev)
        }}
      >
        <summary className="btn btn-md w-44">{`Page ${props.offset + 1} of ${pageCount} (${
          props.amount
        })`}</summary>
        <ol className="dropdown-content text-center">
          {[5, 10, 25, 50, 100].map((value) => (
            <li
              key={`li_${value}`}
              onClick={(e): void => {
                e.stopPropagation()
                props.handleAmount(value)
                setOpen(false)
              }}
            >
              {value}
            </li>
          ))}
        </ol>
      </details>
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
