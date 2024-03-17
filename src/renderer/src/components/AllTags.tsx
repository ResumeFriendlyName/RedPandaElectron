import Tag from '@renderer/models/tag'
import { useEffect, useState } from 'react'
import TagChip from './TagChip'
import AddTagDropdown from './dropdowns/AddTagDropdown'
import InfoButton from './buttons/InfoButton'
import { WarningModal } from './modals/StatusModals'

interface AllTagsProps {
  handleErrorMessage: (value: string) => void
}

const AllTags = (props: AllTagsProps): JSX.Element => {
  const [tags, setTags] = useState<Tag[]>([])
  const [showWarningForTag, setShowWarningForTag] = useState<Tag | undefined>(undefined)

  const getTags = (): Promise<void> =>
    window.api
      .getTags()
      .then(setTags)
      .catch((err: Error) => props.handleErrorMessage(err.message))

  const handleTagDelete = (id: number): void => {
    window.api
      .deleteTag(id)
      .then(() => setTags((prev) => prev.filter((tag) => tag.id !== id)))
      .catch((err: Error) => props.handleErrorMessage(err.message))
  }

  const handleTagAdd = (tag: Tag): void => {
    if (tag.id === -1) {
      window.api
        .insertTag(tag)
        .then(() => getTags())
        .catch((err: Error) => props.handleErrorMessage(err.message))
    }
  }

  useEffect(() => {
    getTags()
  }, [])

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center gap-6 w-full">
        <AddTagDropdown tags={tags} handleSelect={handleTagAdd} />

        <InfoButton
          headingText={'Tag management info'}
          content={
            <p>
              Please note, deleting a tag here will delete it from every transaction that has been
              assigned to it.
            </p>
          }
          modalClassName="w-[40rem]"
        />
      </div>

      {tags.map((tag) => (
        <TagChip
          key={`tag_${tag.id}`}
          text={tag.name}
          onDelete={(): void => setShowWarningForTag(tag)}
        />
      ))}

      <WarningModal
        open={showWarningForTag !== undefined}
        textElement={
          <p>
            {`Are you sure you want to delete the tag "${showWarningForTag?.name}"?\n`}
            <b>This will delete it for every assigned transaction.</b>
          </p>
        }
        yesChoiceName="Delete"
        noChoiceName="Cancel"
        handleChoice={(choice): void => {
          if (choice) {
            handleTagDelete(showWarningForTag!.id)
          }
          setShowWarningForTag(undefined)
        }}
      />
    </div>
  )
}

export default AllTags
