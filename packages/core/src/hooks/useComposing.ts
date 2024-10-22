import { createContext, useContext, type Accessor } from 'solid-js'
import { useRequiredContext } from './useRequiredContext'

/**
 * A SolidJS context for sharing the `composing` state of the editor.
 */

export const ComposingContext = createContext<Accessor<boolean> | null>(null)

/**
 * Get the current `composing` state of the editor.
 */

export const useComposing = (): Accessor<boolean> => {
  return useRequiredContext(
    ComposingContext,
    'ComposingContext',
    `The \`useComposing\` hook must be used inside the <Slate> component's context.`,
  )
}
