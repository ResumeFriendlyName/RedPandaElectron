import { useEffect, useState } from 'react'
import InputDropdown from './InputDropdown'
import Tag from '@renderer/models/tag'
import InfoButton from '../buttons/InfoButton'
import TagRuleModal from '../modals/TagRuleModal'
import { getTagFromString } from '@renderer/utils/TagUtils'

interface TagRuleDropdownAndInfoProps {
  tags: Tag[]
  handleError: (err: Error) => void
}

const TagRuleDropdownAndInfo = (props: TagRuleDropdownAndInfoProps): JSX.Element => {
  const [tags, setTags] = useState<Tag[]>(props.tags)
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined)
  const [tagInput, setTagInput] = useState<string>('')

  const handleTagInput = (value: string): void => setTagInput(value)
  const handleSelect = (value: string): void => {
    const tag: Tag | undefined = getTagFromString(tags, value)
    if (tag === undefined) {
      props.handleError(new Error(`Tag, "${value}" no longer exists. Please report this bug.`))
    } else {
      setSelectedTag(tag)
    }
  }
  const handleCancel = (): void => setSelectedTag(undefined)
  const handleError = (err: Error): void => {
    setSelectedTag(undefined)
    props.handleError(err)
  }
  const handleSubmit = (tagId: number): void => {
    window.api
      .applyTagRuleToTransactions(tagId)
      // TODO: At some point display to the user how many changes were made
      // .then((count) => console.log(count))
      .catch(props.handleError)
      .finally(() => setSelectedTag(undefined))
  }
  // Incase you want to delete all associated tags, but the alternative for now
  // is just deleting that tag and starting over again. Will revisit if is an issue
  const handleDelete = (): void => setSelectedTag(undefined)

  useEffect(() => setTags(props.tags), [props.tags])
  useEffect(() => {
    window.api.getTags(tagInput).then(setTags).catch(props.handleError)
  }, [tagInput])

  return (
    <div className="flex gap-6 items-center">
      <InputDropdown
        input={tagInput}
        placeholder="Search For Existing Tag"
        maxLength={20}
        dropdownItems={tags.map((tag) => tag.name)}
        width={16}
        disableNewItem
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
          handleCancel={handleCancel}
          handleSubmit={handleSubmit}
          handleDelete={handleDelete}
          handleError={handleError}
        />
      )}
    </div>
  )
}

export default TagRuleDropdownAndInfo
