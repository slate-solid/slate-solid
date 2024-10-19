import { createContext, useContext, type Accessor } from 'solid-js'
import type { Editor } from 'slate'
import type { SolidEditor } from '../plugin/solid-editor'
import { useRequiredContext } from './useRequiredContext'

/**
 * A SolidJS context for sharing the editor object.
 */

export const EditorContext = createContext<Accessor<SolidEditor> | null>(null)

/**
 * Get the current editor object from the Solid context.
 */

export const useSlateStatic = (): Accessor<Editor> => {
  return useRequiredContext(
    EditorContext,
    'EditorContext',
    `The \`useSlateStatic\` hook must be used inside the <Slate> component's context.`,
  )
}
