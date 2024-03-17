import {
  IconDefinition,
  faBomb,
  faCircleInfo,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Modal from './Modal'
import { useEffect, useState } from 'react'

interface BaseModalProps {
  open: boolean
  headingText: string
  content: JSX.Element
  icon: IconDefinition
  color: string // This should be a valid tailwind value
  className?: string
}

const BaseModal = (props: React.PropsWithChildren<BaseModalProps>): JSX.Element => {
  return (
    <Modal open={props.open} className={`${props.className || ''}`}>
      <div className={`modal-content`}>
        <FontAwesomeIcon icon={props.icon} size="2x" className={props.color} />
        <h3>{props.headingText}</h3>
        {props.content}
        {/* Input functionality here */}
        <form method="dialog">{props.children}</form>
      </div>
    </Modal>
  )
}

interface StatusModalProps extends BaseModalProps {
  handleClose: () => void
}

const StatusModal = (props: StatusModalProps): JSX.Element => {
  return (
    <BaseModal {...props}>
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
    </BaseModal>
  )
}

interface StatusChoiceModalProps extends BaseModalProps {
  yesChoiceName: string
  noChoiceName: string
  handleChoice: (value: boolean) => void
}

const StatusChoiceModal = (props: StatusChoiceModalProps): JSX.Element => {
  return (
    <BaseModal {...props}>
      <button
        className="btn btn-sm mr-3 opacity-80"
        onClick={(e): void => {
          e.preventDefault()
          props.handleChoice(false)
        }}
      >
        {props.noChoiceName}
      </button>
      <button
        className="btn btn-sm"
        onClick={(e): void => {
          e.preventDefault()
          props.handleChoice(true)
        }}
      >
        {props.yesChoiceName}
      </button>
    </BaseModal>
  )
}

interface InfoModalProps {
  open: boolean
  headingText: string
  content: JSX.Element
  className?: string
  handleClose: () => void
}

const InfoModal = (props: InfoModalProps): JSX.Element => {
  return (
    <StatusModal
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

interface ErrorModalProps {
  contentText: string
  handleClose: () => void
}

const ErrorModal = (props: ErrorModalProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false)
  useEffect(() => {
    if (props.contentText !== '') {
      setOpen(true)
    }
  }, [props.contentText])

  return (
    <StatusModal
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

interface WarningModalProps {
  open: boolean
  yesChoiceName: string
  noChoiceName: string
  textElement: JSX.Element
  handleChoice: (value: boolean) => void
}

const WarningModal = (props: WarningModalProps): JSX.Element => {
  return (
    <StatusChoiceModal
      open={props.open}
      headingText="Warning"
      content={props.textElement}
      icon={faTriangleExclamation}
      color="text-warning"
      yesChoiceName={props.yesChoiceName}
      noChoiceName={props.noChoiceName}
      className="whitespace-pre-line"
      handleChoice={props.handleChoice}
    />
  )
}

export { ErrorModal, InfoModal, WarningModal }
