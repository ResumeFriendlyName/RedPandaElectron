import Tag from '@renderer/models/tag'
import { ComponentSize } from '@renderer/models/types'
import { useEffect, useState } from 'react'
import { ErrorModal } from './StatusModals'
import InputDropdown from './InputDropdown'

interface AddTagButtonProps {
  handleSelect: (tag: Tag) => void
}

const AddTagButton = (props: AddTagButtonProps): JSX.Element => {
  const [tags, setTags] = useState<Tag[]>([])
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [tagInput, setTagInput] = useState<string>('')

  const handleTagInput = (value: string): void => setTagInput(value)

  useEffect(() => {
    window.api
      .getTags(tagInput)
      .then(setTags)
      .catch((err: Error) => setErrorMsg(err.message))
  }, [tagInput])

  return (
    <>
      <InputDropdown
        input={tagInput}
        placeholder="Add Tag"
        dropdownItems={tags.map((map) => map.name)}
        size={ComponentSize.SM}
        handleInput={handleTagInput}
        handleSelect={(value: string): void => {
          const tag: Tag | undefined = tags.find((tag) => tag.name == value)
          props.handleSelect(tag !== undefined ? tag : { id: -1, name: value })
        }}
      />
      <ErrorModal contentText={errorMsg} handleClose={(): void => setErrorMsg('')} />
    </>
  )
}

export default AddTagButton
