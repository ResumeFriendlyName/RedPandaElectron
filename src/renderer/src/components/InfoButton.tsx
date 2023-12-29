import { faInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { InfoModal } from './StatusModals'
import { useState } from 'react'

interface InfoButtonProps {
  headingText: string
  content: JSX.Element
  modalClassName?: string
}

const InfoButton = (props: InfoButtonProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <>
      <button className="btn btn-sm btn-round" onClick={(): void => setOpen(true)}>
        <FontAwesomeIcon icon={faInfo} />
      </button>
      <InfoModal
        open={open}
        headingText={props.headingText}
        content={props.content}
        handleClose={(): void => {
          setOpen(false)
        }}
        className={props.modalClassName || ''}
      />
    </>
  )
}

export default InfoButton
