import { faCircleMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface TagProps {
  text: string
  onDelete: () => void
}

const TagChip = (props: TagProps): JSX.Element => {
  return (
    <div className="tag flex items-center gap-1">
      <button className="btn btn-xs" onClick={(): void => props.onDelete()}>
        <FontAwesomeIcon icon={faCircleMinus} />
      </button>
      <span>{props.text}</span>
    </div>
  )
}

export default TagChip
