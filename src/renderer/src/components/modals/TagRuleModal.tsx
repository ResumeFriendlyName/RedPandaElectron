import Tag from '@renderer/models/tag'
import Modal from './Modal'
import { useEffect, useState } from 'react'
import InfoButton from '../buttons/InfoButton'
import InputArea from '@renderer/components/input/InputArea'
import TagRule from '@renderer/models/tagRule'

interface TagRuleModalProps {
  open: boolean
  tag: Tag
  handleCancel: () => void
  handleDelete: () => void
  handleSubmit: (tagRuleId: number) => void
  handleError: (err: Error) => void
}

const TagRuleModal = (props: TagRuleModalProps): JSX.Element => {
  const [input, setInput] = useState<string>('')
  const [tagRule, setTagRule] = useState<TagRule | undefined>()
  const handleInput = (value: string): void => setInput(value)
  const handleCancel = (): void => {
    setInput('')
    props.handleCancel()
  }
  const handleSubmit = (): void => {
    const value = input.trim()
    if (value) {
      const values = value.split('\n')
      if (tagRule) {
        window.api
          .updateTagRule(tagRule.id, values)
          .then(() => props.handleSubmit(tagRule.id))
          .catch(props.handleError)
      } else {
        window.api
          .insertTagRule(props.tag.id, values)
          .then(props.handleSubmit)
          .catch(props.handleError)
      }
    } else if (tagRule) {
      window.api
        .deleteTagRule(tagRule.id)
        .then(() => props.handleDelete())
        .catch(props.handleError)
    } else {
      // Cancel if no value was set and a tag rule didn't previously exist
      props.handleCancel()
    }
  }

  useEffect(() => {
    window.api.getTagRuleForTagId(props.tag.id).then(setTagRule).catch(props.handleError)
  }, [])

  useEffect(() => {
    if (tagRule) {
      setInput(tagRule.values.join('\n'))
    }
  }, [tagRule])

  return (
    <Modal open={props.open}>
      <div className="modal-content">
        <h3>Auto Tag Rules for {props.tag.name}</h3>
        <p>Transaction descriptions that contains,</p>
        <div className="flex gap-2">
          <InputArea
            placeholder="some text..."
            input={input}
            handleInput={handleInput}
            className="w-96 h-48"
          />
          <InfoButton
            headingText="Auto Tag Text Help"
            content={
              <p>
                Any transaction&apos;s description that contains this <b>case-insensitive</b> input
                will be tagged. <br />
                Enter separate match phrases on <b>different lines</b>.
              </p>
            }
          />
        </div>
        <p>
          will be tagged with the <i>{props.tag.name}</i> tag.
        </p>
        <form method="dialog" className="flex gap-2">
          <button className="btn btn-md" onClick={handleCancel}>
            <span>Cancel</span>
          </button>
          <button className="btn btn-md" onClick={handleSubmit}>
            <span>Submit</span>
          </button>
        </form>
      </div>
    </Modal>
  )
}

export default TagRuleModal
