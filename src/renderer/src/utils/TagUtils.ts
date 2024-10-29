import Tag from '@renderer/models/tag'

export const getTagFromString = (tags: Tag[], value: string): Tag | undefined => {
  return tags.find((tag) => tag.name == value)
}
