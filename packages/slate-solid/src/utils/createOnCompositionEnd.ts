import type { Accessor, JSX } from 'solid-js'
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager'
import type { MutableRefObject } from '../hooks/useRef'
import {
  EDITOR_TO_PENDING_INSERTION_MARKS,
  EDITOR_TO_USER_MARKS,
  IS_ANDROID,
  IS_COMPOSING,
  IS_FIREFOX_LEGACY,
  IS_IOS,
  IS_UC_MOBILE,
  IS_WEBKIT,
  IS_WECHATBROWSER,
  type DOMEditor,
} from 'slate-dom'
import type { HTMLEvent } from './types'
import { SolidEditor } from '../plugin/solid-editor'
import { isEventHandled } from './isEventHandled'
import { Editor } from 'slate'

/**
 * Create `onCompositionEnd` handler for `Editable`.
 */
export function createOnCompositionEnd({
  androidInputManagerRef,
  editor,
  onCompositionEnd,
  onStopComposing,
}: {
  androidInputManagerRef: MutableRefObject<
    AndroidInputManager | null | undefined
  >
  editor: Accessor<DOMEditor>
  onCompositionEnd?: JSX.EventHandlerUnion<HTMLDivElement, CompositionEvent>
  onStopComposing: () => void
}) {
  return (event: HTMLEvent<CompositionEvent>) => {
    if (SolidEditor.hasSelectableTarget(editor(), event.target)) {
      if (SolidEditor.isComposing(editor())) {
        Promise.resolve().then(() => {
          onStopComposing()
          IS_COMPOSING.set(editor(), false)
        })
      }

      androidInputManagerRef.current?.handleCompositionEnd(event)

      if (isEventHandled(event, onCompositionEnd) || IS_ANDROID) {
        return
      }

      // COMPAT: In Chrome, `beforeinput` events for compositions
      // aren't correct and never fire the "insertFromComposition"
      // type that we need. So instead, insert whenever a composition
      // ends since it will already have been committed to the DOM.
      if (
        !IS_WEBKIT &&
        !IS_FIREFOX_LEGACY &&
        !IS_IOS &&
        !IS_WECHATBROWSER &&
        !IS_UC_MOBILE &&
        event.data
      ) {
        const placeholderMarks = EDITOR_TO_PENDING_INSERTION_MARKS.get(editor())
        EDITOR_TO_PENDING_INSERTION_MARKS.delete(editor())

        // Ensure we insert text with the marks the user was actually seeing
        if (placeholderMarks !== undefined) {
          EDITOR_TO_USER_MARKS.set(editor(), editor().marks)
          editor().marks = placeholderMarks
        }

        Editor.insertText(editor(), event.data)

        const userMarks = EDITOR_TO_USER_MARKS.get(editor())
        EDITOR_TO_USER_MARKS.delete(editor())
        if (userMarks !== undefined) {
          editor().marks = userMarks
        }
      }
    }
  }
}
