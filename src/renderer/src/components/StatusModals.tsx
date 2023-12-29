import { IconDefinition, faBomb, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Modal from './Modal'
import { useEffect, useState } from 'react'

interface ErrorModalProps {
  contentText: string
  handleClose: () => void
}

interface InfoModalProps {
  open: boolean
  headingText: string
  content: JSX.Element
  className?: string
  handleClose: () => void
}

interface StatusModalProps {
  open: boolean
  headingText: string
  content: JSX.Element
  icon: IconDefinition
  color: string // This should be a valid tailwind value
  className?: string
  handleClose: () => void
}

const GenericStatusModal = (props: StatusModalProps): JSX.Element => {
  return (
    <Modal open={props.open} className={`${props.className || ''}`}>
      <div className={`modal-content`}>
        <FontAwesomeIcon icon={props.icon} size="2x" className={props.color} />
        <h3>{props.headingText}</h3>
        {props.content}
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
    </Modal>
  )
}

const InfoModal = (props: InfoModalProps): JSX.Element => {
  return (
    <GenericStatusModal
      open={props.open}
      headingText={props.headingText}
      content={props.content}
      handleClose={props.handleClose}
      icon={faCircleInfo}
      color="text-info"
      className={props.className || ''}
    />
  )
}

const ErrorModal = (props: ErrorModalProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false)
  useEffect(() => {
    if (props.contentText !== '') {
      setOpen(true)
    }
  }, [props.contentText])

  return (
    <GenericStatusModal
      open={open}
      headingText={'An error has occurred!'}
      content={<p>{props.contentText}</p>}
      handleClose={(): void => {
        setOpen(false)
        props.handleClose()
      }}
      icon={faBomb}
      color="text-error"
      className="max-w-xl"
    />
  )
}

export { ErrorModal, InfoModal }
