import { Point, Range } from 'slate'
import type { JSX } from 'solid-js/jsx-runtime'

// TODO: This module has a lot more code in `slate-react`.
// For now just need the `Action` type. Also seems `Action` could possibly be
// moved outside of this android specific location.
export type Action = { at?: Point | Range; run: () => void }

export type AndroidInputManager = {
  flush: () => void
  scheduleFlush: () => void

  hasPendingDiffs: () => boolean
  hasPendingAction: () => boolean
  hasPendingChanges: () => boolean
  isFlushing: () => boolean | 'action'

  handleUserSelect: (range: Range | null) => void
  handleCompositionEnd: (event: CompositionEvent) => void
  handleCompositionStart: (event: CompositionEvent) => void
  handleDOMBeforeInput: (event: InputEvent) => void
  handleKeyDown: (event: KeyboardEvent) => void

  handleDomMutations: (mutations: MutationRecord[]) => void
  handleInput: () => void
}
