import Tag from '@renderer/models/tag'
import { ComponentSize } from '@renderer/models/types'
import { useEffect, useState } from 'react'
import { ErrorModal } from '../modals/StatusModals'
import InputDropdown from './InputDropdown'
import TransactionWithTags from '@renderer/models/transactionWithTags'

interface AddTagDropdownProps {
  transactionWithTags?: TransactionWithTags
  handleSelect: (tag: Tag) => void
}

/**
 * An input dropdown that can be used to select existing tags or new tags
 * @param handleSelect Returns the selected tag. If id is -1, the tag is new
 */
const AddTagDropdown = (props: AddTagDropdownProps): JSX.Element => {
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
        dropdownItems={
          props.transactionWithTags === undefined
            ? tags.map((map) => map.name)
            : tags
                .filter(
                  (tag) =>
                    !props.transactionWithTags!.tags.some((compareTag) => compareTag.id === tag.id)
                )
                .map((tag) => tag.name)
        }
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

export default AddTagDropdown