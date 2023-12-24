import {
  IconDefinition,
  faArrowRightFromBracket,
  faCoins,
  faSliders
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Outlet } from 'react-router-dom'

const ViewLayout = (): JSX.Element => {
  return (
    <div className="min-h-full p-4 flex flex-col gap-3 bg-neutral">
      <div className="flex justify-between items-end">
        <h1 className="text-neutral-content">Red Panda</h1>
        <div className="flex justify-between gap-4 z-10">
          <div className="w-[250px] h-[100px] right-0 top-0 absolute bg-primary -z-10 rounded-bl-3xl rounded-br-3xl drop-shadow-lg" />
          <ButtonAndText icon={faCoins} text="Finances" />
          <ButtonAndText icon={faSliders} text="Settings" />
          <ButtonAndText icon={faArrowRightFromBracket} text="Log out" />
        </div>
      </div>
      <Outlet />
    </div>
  )
}

interface ButtonAndTextProps {
  icon: IconDefinition
  text: string
}

const ButtonAndText = (props: ButtonAndTextProps): JSX.Element => {
  return (
    <div className="flex flex-col items-center gap-1">
      <button className="btn btn-md btn-round">
        <FontAwesomeIcon icon={props.icon} />
      </button>
      <span className="text-neutral-content">{props.text}</span>
    </div>
  )
}

export default ViewLayout
