import Tag from '@renderer/models/tag'
import { useEffect, useState } from 'react'
import TagChip from './TagChip'
import AddTagDropdown from './dropdowns/AddTagDropdown'

interface AllTagsProps {
  handleErrorMessage: (value: string) => void
}

const AllTags = (props: AllTagsProps): JSX.Element => {
  const [tags, setTags] = useState<Tag[]>([])

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
      <AddTagDropdown handleSelect={handleTagAdd} />

      {tags.map((tag) => (
        <TagChip
          key={`tag_${tag.id}`}
          text={tag.name}
          onDelete={(): void => handleTagDelete(tag.id)}
        />
      ))}
    </div>
  )
}

export default AllTags
