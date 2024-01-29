import Modal from '../modals/Modal'

interface LoaderProps {
  open: boolean
}

const Loader = (props: LoaderProps): JSX.Element => {
  return (
    // Little "hack" to add backdrop, and remove white background from Modal
    <Modal open={props.open} className="p-0">
      <div className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
        <div className="loader" />
      </div>
    </Modal>
  )
}

export default Loader
