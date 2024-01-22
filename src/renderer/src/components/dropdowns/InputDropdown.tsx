import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ComponentSize } from '@renderer/models/types'
import { useRef, useState } from 'react'

interface InputDropdownProps {
  input: string
  placeholder: string
  dropdownItems: string[]
  size: ComponentSize
  className?: string
  handleInput: (value: string) => void
  handleSelect: (value: string) => void
}

const InputDropdown = (props: InputDropdownProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleSelect = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent> | React.KeyboardEvent<HTMLInputElement>,
    value: string
  ): void => {
    e.stopPropagation()
    setOpen(false)
    props.handleSelect(value)
    props.handleInput('')
  }

  return (
    <details
      className={`dropdown ${props.className ? props.className : ''}`}
      open={open}
      onBlur={(): void => setOpen(false)}
      onKeyDown={(e): void => {
        if (e.key === 'Escape') {
          setOpen(false)
          if (inputRef !== null) {
            inputRef.current!.blur()
          }
        }
      }}
    >
      <summary className="summary">
        <div className="input-icon">
          <i>
            <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
          </i>
          <input
            ref={inputRef}
            className="input text-center"
            type="text"
            onClick={(e): void => {
              e.preventDefault()
              setOpen(true)
            }}
            value={props.input}
            placeholder={props.placeholder}
            // Reopen options if mouse left and returned to app while focused
            onFocus={(): void => setOpen(true)}
            onChange={(e): void => props.handleInput(e.target.value)}
            onKeyDown={(e): void => {
              if (e.key === 'Enter') {
                handleSelect(e, props.input)
              }
            }}
          />
        </div>
      </summary>

      <ol className="dropdown-content text-center">
        {props.dropdownItems.length > 0
          ? props.dropdownItems.map((value) => (
              <li key={`li_${value}`} onMouseDown={(e): void => handleSelect(e, value)}>
                {value}
              </li>
            ))
          : props.input !== '' && (
              <li
                className="badge after:content-['NEW']"
                onMouseDown={(e): void => handleSelect(e, props.input)}
              >
                {props.input}
              </li>
            )}
      </ol>
    </details>
  )
}

export default InputDropdown
