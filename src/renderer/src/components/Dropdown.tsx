import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ComponentSize } from '@renderer/models/types'
import { useState } from 'react'

interface DropdownProps {
  dropdownContent: string
  dropdownItems: string[]
  size: ComponentSize
  className?: string
  handleSelect: (value: string) => void
}

const Dropdown = (props: DropdownProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <details
      className={`dropdown ${props.className ? props.className : ''}`}
      open={open}
      onClick={(e): void => {
        e.preventDefault()
        setOpen((prev) => !prev)
      }}
      onBlur={(): void => setOpen(false)}
    >
      <summary className={`summary btn btn-${props.size} gap-3`}>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
        <span className="text-primary-content">{props.dropdownContent}</span>
      </summary>
      <ol className="dropdown-content text-center">
        {props.dropdownItems.map((value) => (
          <li
            key={`li_${value}`}
            onMouseDown={(e): void => {
              e.stopPropagation()
              setOpen(false)
              props.handleSelect(value)
            }}
          >
            {value}
          </li>
        ))}
      </ol>
    </details>
  )
}

export default Dropdown
