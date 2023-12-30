import { SessionStorageKey } from '@renderer/models/types'
import { useEffect, useState } from 'react'

// Modified from source: https://www.robinwieruch.de/local-storage-react/
const useSessionStorage = <T>(
  storageKey: SessionStorageKey
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(JSON.parse(sessionStorage.getItem(storageKey) ?? '[]'))

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(value))
  }, [value, storageKey])

  return [value, setValue]
}

export default useSessionStorage
