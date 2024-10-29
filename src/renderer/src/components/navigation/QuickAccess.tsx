import {
  IconDefinition,
  faArrowRightFromBracket,
  faCoins,
  faSliders
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface ButtonAndTextProps {
  icon: IconDefinition
  text: string
  link: string
  activeButtonText: string
  handleActiveButtonText: (value: string) => void
}

const ButtonAndText = (props: ButtonAndTextProps): JSX.Element => {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center gap-1">
      {/* TODO: Remove disabled for logout once all button functionality has been implemented */}
      <button
        className="btn btn-md btn-round"
        disabled={props.text == 'Log out' || props.text == props.activeButtonText}
        onClick={(): void => {
          props.handleActiveButtonText(props.text)
          navigate(props.link)
        }}
      >
        <FontAwesomeIcon icon={props.icon} />
      </button>
      <span className="text-neutral-content select-none">{props.text}</span>
    </div>
  )
}

const QuickAccess = (): JSX.Element => {
  const [activeButtonText, setActiveButtonText] = useState<string>('Finances')

  const handleActiveButtonText = (value: string): void => setActiveButtonText(value)

  return (
    <div className="flex justify-between gap-4 z-10">
      <div className="w-[250px] h-[100px] right-0 top-0 absolute bg-primary -z-10 rounded-bl-3xl rounded-br-3xl drop-shadow-lg" />
      <ButtonAndText
        icon={faCoins}
        text="Finances"
        link=""
        activeButtonText={activeButtonText}
        handleActiveButtonText={handleActiveButtonText}
      />
      <ButtonAndText
        icon={faSliders}
        text="Settings"
        link="settings"
        activeButtonText={activeButtonText}
        handleActiveButtonText={handleActiveButtonText}
      />
      <ButtonAndText
        icon={faArrowRightFromBracket}
        text="Log out"
        link=""
        activeButtonText={activeButtonText}
        handleActiveButtonText={handleActiveButtonText}
      />
    </div>
  )
}

export default QuickAccess
