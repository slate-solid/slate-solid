import { createContext, useContext } from 'solid-js'

/**
 * A SolidJS context for sharing the `readOnly` state of the editor.
 */

export const ReadOnlyContext = createContext(false)

/**
 * Get the current `readOnly` state of the editor.
 */

export const useReadOnly = (): boolean => {
  return useContext(ReadOnlyContext)
}
