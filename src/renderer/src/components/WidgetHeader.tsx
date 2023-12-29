import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate } from 'react-router-dom'

interface WidgetHeader {
  heading: string
}

const WidgetHeader = (props: WidgetHeader): JSX.Element => {
  const navigate = useNavigate()

  return (
    <div className="widget-header">
      <h2>{props.heading}</h2>
      {/* Close expanded widget view button */}
      <button className="btn btn-sm" onClick={(): void => navigate('/')}>
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  )
}

export default WidgetHeader
