import {
  IconDefinition,
  faArrowRightFromBracket,
  faCoins,
  faSliders
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate } from 'react-router-dom'

interface ButtonAndTextProps {
  icon: IconDefinition
  text: string
  link: string
}

const ButtonAndText = (props: ButtonAndTextProps): JSX.Element => {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center gap-1">
      {/* TODO: Remove disabled once all button functionality has been implemented */}
      <button
        className="btn btn-md btn-round"
        disabled={props.text != 'Settings'}
        onClick={(): void => navigate(props.link)}
      >
        <FontAwesomeIcon icon={props.icon} />
      </button>
      <span className="text-neutral-content select-none">{props.text}</span>
    </div>
  )
}

const QuickAccess = (): JSX.Element => {
  return (
    <div className="flex justify-between gap-4 z-10">
      <div className="w-[250px] h-[100px] right-0 top-0 absolute bg-primary -z-10 rounded-bl-3xl rounded-br-3xl drop-shadow-lg" />
      <ButtonAndText icon={faCoins} text="Finances" link="" />
      <ButtonAndText icon={faSliders} text="Settings" link="settings" />
      <ButtonAndText icon={faArrowRightFromBracket} text="Log out" link="" />
    </div>
  )
}

export default QuickAccess
