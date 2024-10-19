import { createContext, useContext } from 'solid-js'

/**
 * A SolidJS context for sharing the `composing` state of the editor.
 */

export const ComposingContext = createContext(false)

/**
 * Get the current `composing` state of the editor.
 */

export const useComposing = (): boolean => {
  return useContext(ComposingContext)
}
