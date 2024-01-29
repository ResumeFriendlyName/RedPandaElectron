import { useEffect, useState } from 'react'
import Modal from '../modals/Modal'

interface LoaderProps {
  open: boolean
}

const Loader = (props: LoaderProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(props.open)

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined = undefined

    if (props.open) {
      // Only show loading screen after 3 seconds so the screen doesn't flicker
      timeout = setTimeout(() => {
        if (props.open) {
          setOpen(true)
        }
      }, 3000)
    } else {
      setOpen(false)
    }

    if (timeout !== undefined) {
      return () => clearTimeout(timeout)
    }
    return
  }, [props.open])

  return (
    // Little "hack" to add backdrop, and remove white background from Modal
    <Modal open={open} className="p-0">
      <div className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
        <div className="loader" />
      </div>
    </Modal>
  )
}

export default Loader
