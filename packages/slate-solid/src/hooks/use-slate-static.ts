import { createContext, useContext } from 'solid-js'
import type { Editor } from 'slate'
import type { SolidEditor } from '../plugin/solid-editor'

/**
 * A SolidJS context for sharing the editor object.
 */

export const EditorContext = createContext<SolidEditor | null>(null)

/**
 * Get the current editor object from the Solid context.
 */

export const useSlateStatic = (): Editor => {
  const editor = useContext(EditorContext)

  if (!editor) {
    throw new Error(
      `The \`useSlateStatic\` hook must be used inside the <Slate> component's context.`,
    )
  }

  return editor
}
