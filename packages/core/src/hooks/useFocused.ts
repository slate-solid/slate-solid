import { createContext, useContext, type Accessor } from 'solid-js'

/**
 * A SolidJS context for sharing the `focused` state of the editor.
 */

export const FocusedContext = createContext<Accessor<boolean>>(() => false)

/**
 * Get the current `focused` state of the editor.
 */

export const useFocused = (): Accessor<boolean> => {
  return useContext(FocusedContext)
}
