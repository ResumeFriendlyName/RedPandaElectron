interface InputBarProps {
  input: string
  placeholder: string
  maxLength?: number
  handleInput: (value: string) => void
}

const InputBar = (props: InputBarProps): JSX.Element => {
  return (
    <input
      className="input text-center"
      type="text"
      maxLength={props.maxLength}
      value={props.input}
      placeholder={props.placeholder}
      onChange={(e): void => props.handleInput(e.target.value)}
    />
  )
}

export default InputBar
