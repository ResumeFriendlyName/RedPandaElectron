import { IconDefinition, faBomb } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Modal from './Modal'
import { useEffect, useState } from 'react'

interface StatusModalProps {
  contentText: string
}
interface GenericStatusModalProps extends StatusModalProps {
  headingText: string
  icon: IconDefinition
  color: string // This should be a valid tailwind value
}

const GenericStatusModal = (props: GenericStatusModalProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false)
  useEffect(() => {
    if (props.contentText !== '') {
      setOpen(true)
    }
  }, [props.contentText])
  return (
    <Modal open={open} className="max-w-xl">
      <div className="modal-content">
        <FontAwesomeIcon icon={props.icon} size="2x" className={props.color} />
        <h3>{props.headingText}</h3>
        <p className="text-center">{props.contentText}</p>
        <form method="dialog">
          <button
            className="btn btn-sm"
            onClick={(e): void => {
              e.preventDefault()
              setOpen(false)
            }}
            type="submit"
          >
            <span>Okay</span>
          </button>
        </form>
      </div>
    </Modal>
  )
}

const ErrorModal = (props: StatusModalProps): JSX.Element => {
  return (
    <GenericStatusModal
      contentText={props.contentText}
      headingText="An error has occurred!"
      icon={faBomb}
      color="text-error"
    />
  )
}

export { ErrorModal }
