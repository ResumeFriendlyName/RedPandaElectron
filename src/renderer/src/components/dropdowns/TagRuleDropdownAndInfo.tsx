import { useEffect, useState } from 'react'
import InputDropdown from './InputDropdown'
import Tag from '@renderer/models/tag'
import { ErrorModal } from '../modals/StatusModals'
import InfoButton from '../buttons/InfoButton'
import TagRuleModal from '../modals/TagRuleModal'
import { getTagFromString } from '@renderer/utils/TagUtils'

interface TagRuleDropdownAndInfoProps {
  tags: Tag[]
}

const TagRuleDropdownAndInfo = (props: TagRuleDropdownAndInfoProps): JSX.Element => {
  const [tags, setTags] = useState<Tag[]>(props.tags)
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [tagInput, setTagInput] = useState<string>('')

  const handleTagInput = (value: string): void => setTagInput(value)
  const handleSelect = (value: string): void => {
    const tag: Tag | undefined = getTagFromString(tags, value)
    if (tag === undefined) {
      setErrorMsg(`Tag, "${value}" no longer exists. Please report this bug.`)
    } else {
      setSelectedTag(tag)
    }
  }
  const handleError = (err: Error): void => setErrorMsg(err.message)
  const handleClose = (): void => setSelectedTag(undefined)

  useEffect(() => setTags(props.tags), [props.tags])
  useEffect(() => {
    window.api
      .getTags(tagInput)
      .then(setTags)
      .catch((err: Error) => setErrorMsg(err.message))
  }, [tagInput])

  return (
    <div className="flex gap-6 items-center">
      <InputDropdown
        input={tagInput}
        placeholder="Search For Existing Tag"
        maxLength={20}
        dropdownItems={tags.map((tag) => tag.name)}
        width={16}
        handleInput={handleTagInput}
        handleSelect={handleSelect}
      />
      <InfoButton
        headingText={'Auto Rule Info'}
        content={
          <p>
            Add a rule for a tag that <b>will</b> be applied to existing and imported transactions.
            <br />
            Rules will be automatically applied to any matching transactions.
            <br />
            <b>Similar to the rules in Outlook.</b>
          </p>
        }
        modalClassName="w-[41rem]"
      />
      {selectedTag !== undefined && (
        <TagRuleModal
          open={true}
          tag={selectedTag}
          handleClose={handleClose}
          handleError={handleError}
        />
      )}
      <ErrorModal contentText={errorMsg} handleClose={(): void => setErrorMsg('')} />
    </div>
  )
}

export default TagRuleDropdownAndInfo
