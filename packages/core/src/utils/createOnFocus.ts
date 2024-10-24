import type { Accessor, JSX } from 'solid-js'
import type { HTMLEvent } from './types'
import {
  IS_FIREFOX,
  IS_FOCUSED,
  type DOMEditor,
  type DOMElement,
} from 'slate-dom'
import { SolidEditor } from '../plugin/solid-editor'
import { isEventHandled } from './isEventHandled'

/**
 * Create `onFocus` handler for `Editable` component.
 */
export function createOnFocus({
  editor,
  readOnly,
  state,
  onFocus,
}: {
  editor: Accessor<DOMEditor>
  readOnly: Accessor<boolean>
  state: { isUpdatingSelection: boolean; latestElement: DOMElement | null }
  onFocus?: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent>
}) {
  return (event: HTMLEvent<FocusEvent>) => {
    if (
      !readOnly &&
      !state.isUpdatingSelection &&
      SolidEditor.hasEditableTarget(editor(), event.target) &&
      !isEventHandled(event, onFocus)
    ) {
      const el = SolidEditor.toDOMNode(editor(), editor())
      const root = SolidEditor.findDocumentOrShadowRoot(editor())
      state.latestElement = root.activeElement

      // COMPAT: If the editor has nested editable elements, the focus
      // can go to them. In Firefox, this must be prevented because it
      // results in issues with keyboard navigation. (2017/03/30)
      if (IS_FIREFOX && event.target !== el) {
        el.focus()
        return
      }

      IS_FOCUSED.set(editor(), true)
    }
  }
}
