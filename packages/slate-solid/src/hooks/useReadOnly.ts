import { createContext, useContext, type Accessor } from 'solid-js'
import { useRequiredContext } from './useRequiredContext'

/**
 * A SolidJS context for sharing the `readOnly` state of the editor.
 */

export const ReadOnlyContext = createContext<Accessor<boolean> | null>(null)

/**
 * Get the current `readOnly` state of the editor.
 */

export const useReadOnly = (): Accessor<boolean> => {
  return useRequiredContext(
    ReadOnlyContext,
    'ReadOnlyContext',
    `The \`useReadOnly\` hook must be used inside the <Slate> component's context.`,
  )
}
