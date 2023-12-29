import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  className?: string
}

const Modal = (props: React.PropsWithChildren<ModalProps>): JSX.Element => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (ref && ref.current !== null && props.open) {
      ref.current.showModal()
      return () => ref.current?.close()
    }
    return
  }, [props.open])

  return props.open ? (
    <dialog className={`modal ${props.className}`} ref={ref}>
      {props.children}
    </dialog>
  ) : (
    <></>
  )
}

export default Modal
