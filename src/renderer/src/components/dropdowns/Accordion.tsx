import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

interface AccordionProps {
  summary: string
  content: JSX.Element
}

const Accordion = (props: AccordionProps): JSX.Element => {
  const [isExpanded, setExpanded] = useState<boolean>(false)
  return (
    <details className="accordion text-center" open={isExpanded}>
      <summary
        className="btn btn-md gap-3 w-full"
        onClick={(e): void => {
          e.preventDefault()
          setExpanded((prev) => !prev)
        }}
      >
        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
        <span>{props.summary}</span>
      </summary>
      <div className="w-full">{props.content}</div>
    </details>
  )
}

export default Accordion
