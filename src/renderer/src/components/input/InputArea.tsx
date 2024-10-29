interface InputAreaProps {
  input: string
  placeholder: string
  maxLength?: number
  handleInput: (value: string) => void
  className?: string
}

const InputArea = (props: InputAreaProps): JSX.Element => {
  return (
    <textarea
      value={props.input}
      placeholder={props.placeholder}
      onChange={(e): void => props.handleInput(e.target.value)}
      maxLength={props.maxLength}
      className={`textarea resize-none ${props.className}`}
    ></textarea>
  )
}

export default InputArea
