import { faCircleMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface TagProps {
  text: string
}

const TagC = (props: TagProps): JSX.Element => {
  return (
    <div className="tag flex items-center gap-1">
      <button className="btn btn-xs">
        <FontAwesomeIcon icon={faCircleMinus} />
      </button>
      <span>{props.text}</span>
    </div>
  )
}

export default TagC
