import { Outlet } from 'react-router-dom'

const ViewLayout = (): JSX.Element => {
  return (
    <div className="min-h-full p-4">
      <Outlet />
    </div>
  )
}

export default ViewLayout
