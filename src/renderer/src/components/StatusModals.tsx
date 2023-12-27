import { IconDefinition, faBomb } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef } from 'react'

interface StatusModalProps {
  contentText: string
  open: boolean
  handleClose: () => void
}
interface ModalProps extends StatusModalProps {
  headingText: string
  icon: IconDefinition
  color: string // This should be a valid tailwind value
}

const Modal = (props: ModalProps): JSX.Element => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (ref && ref.current !== null && props.open) {
      ref.current.showModal()
      return () => ref.current?.close()
    }
    return
  }, [props.open])

  return props.open ? (
    <dialog className="modal max-w-xl" ref={ref} id="status_modal">
      <div className="modal-content">
        <FontAwesomeIcon icon={props.icon} size="2x" className={props.color} />
        <h3>{props.headingText}</h3>
        <p className="text-center">{props.contentText}</p>
        <form method="dialog">
          <button
            className="btn btn-sm"
            onClick={(e): void => {
              e.preventDefault()
              props.handleClose()
            }}
            type="submit"
          >
            <span>Okay</span>
          </button>
        </form>
      </div>
    </dialog>
  ) : (
    <></>
  )
}

const ErrorModal = (props: StatusModalProps): JSX.Element => {
  return <Modal {...props} headingText="An error has occurred!" icon={faBomb} color="text-error" />
}

export { ErrorModal }
