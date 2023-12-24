import { Outlet } from 'react-router-dom'

const ViewLayout = (): JSX.Element => {
  return (
    <div className="min-h-full p-4 flex flex-col gap-3">
      <Outlet />
    </div>
  )
}

export default ViewLayout
