import { createContext, useContext } from 'solid-js'
import { Range, NodeEntry } from 'slate'

/**
 * A SolidJS context for sharing the `decorate` prop of the editable.
 */

export const DecorateContext = createContext<(entry: NodeEntry) => Range[]>(
  () => [],
)

/**
 * Get the current `decorate` prop of the editable.
 */

export const useDecorate = (): ((entry: NodeEntry) => Range[]) => {
  return useContext(DecorateContext)
}
