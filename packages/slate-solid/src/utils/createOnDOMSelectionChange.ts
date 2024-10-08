import throttle from 'lodash/throttle'

import { Transforms } from 'slate'
import {
  DOMEditor,
  getActiveElement,
  getSelection,
  IS_ANDROID,
  IS_FOCUSED,
  IS_WEBKIT,
  type DOMElement,
} from 'slate-dom'
import type { MutableRefObject } from '../hooks/useRef'
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager'

export interface CreateOnDOMSelectionChangeProps {
  editor: DOMEditor
  androidInputManagerRef: MutableRefObject<
    AndroidInputManager | null | undefined
  >
  processing: MutableRefObject<boolean>
  readOnly: boolean
  state: {
    isDraggingInternally: boolean
    isUpdatingSelection: boolean
    latestElement: DOMElement | null
    hasMarkPlaceholder: boolean
  }
}

export function createOnDOMSelectionChange({
  androidInputManagerRef,
  editor,
  processing,
  readOnly,
  state,
}: CreateOnDOMSelectionChangeProps) {
  return throttle(() => {
    console.log('[TESTING] onDOMSelectionChange')
    const el = DOMEditor.toDOMNode(editor, editor)
    const root = el.getRootNode()

    if (!processing.current && IS_WEBKIT && root instanceof ShadowRoot) {
      processing.current = true

      const active = getActiveElement()

      if (active) {
        document.execCommand('indent')
      } else {
        Transforms.deselect(editor)
      }

      processing.current = false
      return
    }

    const androidInputManager = androidInputManagerRef.current
    if (
      (IS_ANDROID || !DOMEditor.isComposing(editor)) &&
      (!state.isUpdatingSelection || androidInputManager?.isFlushing()) &&
      !state.isDraggingInternally
    ) {
      const root = DOMEditor.findDocumentOrShadowRoot(editor)
      const { activeElement } = root
      const el = DOMEditor.toDOMNode(editor, editor)
      const domSelection = getSelection(root)

      if (activeElement === el) {
        state.latestElement = activeElement
        IS_FOCUSED.set(editor, true)
      } else {
        IS_FOCUSED.delete(editor)
      }

      if (!domSelection) {
        return Transforms.deselect(editor)
      }

      const { anchorNode, focusNode } = domSelection

      const anchorNodeSelectable =
        DOMEditor.hasEditableTarget(editor, anchorNode) ||
        DOMEditor.isTargetInsideNonReadonlyVoid(editor, anchorNode)

      const focusNodeInEditor = DOMEditor.hasTarget(editor, focusNode)

      if (anchorNodeSelectable && focusNodeInEditor) {
        const range = DOMEditor.toSlateRange(editor, domSelection, {
          exactMatch: false,
          suppressThrow: true,
        })

        if (range) {
          if (
            !DOMEditor.isComposing(editor) &&
            !androidInputManager?.hasPendingChanges() &&
            !androidInputManager?.isFlushing()
          ) {
            Transforms.select(editor, range)
          } else {
            androidInputManager?.handleUserSelect(range)
          }
        }
      }

      // Deselect the editor if the dom selection is not selectable in readonly mode
      if (readOnly && (!anchorNodeSelectable || !focusNodeInEditor)) {
        Transforms.deselect(editor)
      }
    }
  }, 100)
}
