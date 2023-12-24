interface TablePaginationProps {
  offset: number
  amount: number
  count: number
  handleOffset: (value: number) => void
  handleAmount: (value: number) => void
}

const TablePagination = (props: TablePaginationProps): JSX.Element => {
  return (
    <div className="table-pagination">
      <button
        onClick={(): void => props.handleOffset(props.offset - 1)}
        disabled={props.offset === 0}
      >
        Back
      </button>
      <form>
        <select
          name="Pagination amount"
          value={props.amount}
          onChange={(e): void => props.handleAmount(Number(e.target.value))}
        >
          {/* Testing value 5 */}
          <option value="5">5</option>
          <option value="6">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </form>
      <button
        onClick={(): void => props.handleOffset(props.offset + 1)}
        disabled={(props.offset + 1) * props.amount >= props.count}
      >
        Forward
      </button>
    </div>
  )
}

export default TablePagination
