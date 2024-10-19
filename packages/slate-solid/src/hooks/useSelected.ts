import { createContext, useContext, type Accessor } from 'solid-js'

/**
 * A SolidJS context for sharing the `selected` state of an element.
 */

export const SelectedContext = createContext<Accessor<boolean>>(() => false)

/**
 * Get the current `selected` state of an element.
 */

export const useSelected = (): Accessor<boolean> => {
  return useContext(SelectedContext)
}
