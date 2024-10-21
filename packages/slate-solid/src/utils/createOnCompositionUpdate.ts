import { IS_COMPOSING, type DOMEditor } from 'slate-dom'
import { SolidEditor } from '../plugin/solid-editor'
import type { HTMLEvent } from './types'
import type { Accessor, JSX } from 'solid-js'
import { isEventHandled } from './isEventHandled'

/**
 * Create `onCompositionUpdate` handler for `Editable`.
 */
export function createOnCompositionUpdate({
  editor,
  onCompositionUpdate,
  onStartComposing,
}: {
  editor: Accessor<DOMEditor>
  onCompositionUpdate?: JSX.EventHandlerUnion<HTMLDivElement, CompositionEvent>
  onStartComposing: () => void
}) {
  return (event: HTMLEvent<CompositionEvent>) => {
    if (
      SolidEditor.hasSelectableTarget(editor(), event.target) &&
      !isEventHandled(event, onCompositionUpdate)
    ) {
      if (!SolidEditor.isComposing(editor())) {
        onStartComposing()
        IS_COMPOSING.set(editor(), true)
      }
    }
  }
}
