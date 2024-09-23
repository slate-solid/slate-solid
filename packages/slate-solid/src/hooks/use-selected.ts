import { createContext, useContext } from 'solid-js'

/**
 * A SolidJS context for sharing the `selected` state of an element.
 */

export const SelectedContext = createContext(false)

/**
 * Get the current `selected` state of an element.
 */

export const useSelected = (): boolean => {
  return useContext(SelectedContext)
}
