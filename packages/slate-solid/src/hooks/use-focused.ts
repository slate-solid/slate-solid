import { createContext, useContext } from 'solid-js'

/**
 * A SolidJS context for sharing the `focused` state of the editor.
 */

export const FocusedContext = createContext(false)

/**
 * Get the current `focused` state of the editor.
 */

export const useFocused = (): boolean => {
  return useContext(FocusedContext)
}
