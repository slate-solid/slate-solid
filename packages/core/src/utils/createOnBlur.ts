import type { Accessor, JSX } from 'solid-js'
import {
  IS_FOCUSED,
  IS_WEBKIT,
  getSelection,
  isDOMElement,
  isDOMNode,
  type DOMEditor,
  type DOMElement,
} from 'slate-dom'
import { Element } from 'slate'
import { SolidEditor } from '../plugin/solid-editor'
import { isEventHandled } from './isEventHandled'
import type { HTMLEvent } from './types'

/**
 * Create `onBlur` handler for `Editable` component.
 */
export function createOnBlur({
  editor,
  readOnly,
  state,
  onBlur,
}: {
  editor: Accessor<DOMEditor>
  readOnly: Accessor<boolean>
  state: { isUpdatingSelection: boolean; latestElement: DOMElement | null }
  onBlur?: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent>
}) {
  return (event: HTMLEvent<FocusEvent>) => {
    if (
      readOnly() ||
      state.isUpdatingSelection ||
      !SolidEditor.hasSelectableTarget(editor(), event.target) ||
      isEventHandled(event, onBlur)
    ) {
      return
    }

    // COMPAT: If the current `activeElement` is still the previous
    // one, this is due to the window being blurred when the tab
    // itself becomes unfocused, so we want to abort early to allow to
    // editor to stay focused when the tab becomes focused again.
    const root = SolidEditor.findDocumentOrShadowRoot(editor())
    if (state.latestElement === root.activeElement) {
      return
    }

    const { relatedTarget } = event
    const el = SolidEditor.toDOMNode(editor(), editor())

    // COMPAT: The event should be ignored if the focus is returning
    // to the editor from an embedded editable element (eg. an <input>
    // element inside a void node).
    if (relatedTarget === el) {
      return
    }

    // COMPAT: The event should be ignored if the focus is moving from
    // the editor to inside a void node's spacer element.
    if (
      isDOMElement(relatedTarget) &&
      relatedTarget.hasAttribute('data-slate-spacer')
    ) {
      return
    }

    // COMPAT: The event should be ignored if the focus is moving to a
    // non- editable section of an element that isn't a void node (eg.
    // a list item of the check list example).
    if (
      relatedTarget != null &&
      isDOMNode(relatedTarget) &&
      SolidEditor.hasDOMNode(editor(), relatedTarget)
    ) {
      const node = SolidEditor.toSlateNode(editor(), relatedTarget)

      if (Element.isElement(node) && !editor().isVoid(node)) {
        return
      }
    }

    // COMPAT: Safari doesn't always remove the selection even if the content-
    // editable element no longer has focus. Refer to:
    // https://stackoverflow.com/questions/12353247/force-contenteditable-div-to-stop-accepting-input-after-it-loses-focus-under-web
    if (IS_WEBKIT) {
      const domSelection = getSelection(root)
      domSelection?.removeAllRanges()
    }

    IS_FOCUSED.delete(editor())
  }
}
