import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'

interface InputDropdownProps {
  input: string
  placeholder: string
  dropdownItems: string[]
  maxLength: number
  width: number
  className?: string
  disableNewItem?: boolean
  excludedItems?: Set<string>
  handleInput: (value: string) => void
  handleSelect: (value: string) => void
}

const InputDropdown = (props: InputDropdownProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const contentRef = useRef<HTMLOListElement | null>(null)
  const [dropdownHeight, setDropdownHeight] = useState<number | string | undefined>(undefined)

  const handleSelect = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent> | React.KeyboardEvent<HTMLInputElement>,
    value: string
  ): void => {
    e.stopPropagation()
    setOpen(false)
    props.handleSelect(value)
    props.handleInput('')
  }

  useEffect(() => {
    if (contentRef.current !== null) {
      const documentOffset = contentRef.current.getBoundingClientRect().top + window.scrollY
      if (contentRef.current.clientHeight + documentOffset > window.innerHeight) {
        setDropdownHeight(window.innerHeight - documentOffset - 16)
        return
      }
    }
    setDropdownHeight('fit-content')
  }, [contentRef])

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
      style={{ width: `${props.width}em` }}
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
            maxLength={props.maxLength}
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

      <ol
        ref={contentRef}
        style={{
          height: dropdownHeight
        }}
        className="dropdown-content text-center overflow-y-auto"
      >
        {props.dropdownItems.length > 0
          ? props.dropdownItems.map(
              (value) =>
                !props.excludedItems?.has(value) && (
                  <li key={`li_${value}`} onMouseDown={(e): void => handleSelect(e, value)}>
                    {value}
                  </li>
                )
            )
          : !props.disableNewItem &&
            props.input !== '' &&
            !props.excludedItems?.has(props.input) && (
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
