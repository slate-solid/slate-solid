import type { Accessor, JSX } from 'solid-js'
import { SolidEditor } from '../plugin/solid-editor'
import type { HTMLEvent } from './types'
import { IS_ANDROID, type DOMEditor } from 'slate-dom'
import { Editor, Range } from 'slate'
import type { MutableRefObject } from '../hooks/useRef'
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager'
import { isEventHandled } from './isEventHandled'

/**
 * Create `onCompositionStart` handler for `Editable`.
 */
export function createOnCompositionStart({
  androidInputManagerRef,
  editor,
  onCompositionStart,
  onStartComposing,
}: {
  androidInputManagerRef: MutableRefObject<
    AndroidInputManager | null | undefined
  >
  editor: Accessor<DOMEditor>
  onCompositionStart?: JSX.EventHandlerUnion<HTMLDivElement, CompositionEvent>
  onStartComposing: () => void
}) {
  return (event: HTMLEvent<CompositionEvent>) => {
    if (SolidEditor.hasSelectableTarget(editor(), event.target)) {
      androidInputManagerRef.current?.handleCompositionStart(event)

      if (isEventHandled(event, onCompositionStart) || IS_ANDROID) {
        return
      }

      onStartComposing()

      const { selection } = editor()
      if (selection && Range.isExpanded(selection)) {
        Editor.deleteFragment(editor())
        return
      }
    }
  }
}
