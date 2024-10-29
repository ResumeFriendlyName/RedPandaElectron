import QuickAccess from '@renderer/components/navigation/QuickAccess'
import { Outlet } from 'react-router-dom'

const ViewLayout = (): JSX.Element => {
  return (
    <div className="min-h-full p-4 flex flex-col gap-10 bg-gradient-to-tr from-neutral-gradient to-neutral">
      <div className="flex justify-between items-end">
        <h1 className="text-neutral-content">Red Panda</h1>
        <QuickAccess />
      </div>
      <Outlet />
    </div>
  )
}

export default ViewLayout
