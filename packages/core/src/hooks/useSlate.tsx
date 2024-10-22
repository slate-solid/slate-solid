import { createContext, useContext, type Accessor } from 'solid-js'
import { SolidEditor } from '../plugin/solid-editor'
import type { Editor } from 'slate'

/**
 * A SolidJS context for sharing the editor object, in a way that re-renders the
 * context whenever changes occur.
 */

export interface SlateContextValue {
  v: number
  editor: Accessor<SolidEditor>
}

export const SlateContext = createContext<Accessor<SlateContextValue> | null>(
  null,
)

/**
 * Get the current editor object from the SolidJS context.
 */

export const useSlate = (): Accessor<Editor> => {
  const context = useContext(SlateContext)

  if (!context) {
    throw new Error(
      `The \`useSlate\` hook must be used inside the <Slate> component's context.`,
    )
  }

  const { editor } = context()
  return editor
}

export const useSlateWithV = () => {
  const context = useContext(SlateContext)

  if (!context) {
    throw new Error(
      `The \`useSlate\` hook must be used inside the <Slate> component's context.`,
    )
  }

  return context
}
