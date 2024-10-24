import { createEffect, type Accessor } from 'solid-js'
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  getDefaultView,
  getSelection,
  IS_ANDROID,
  IS_FIREFOX,
  NODE_TO_ELEMENT,
  type DOMElement,
  type DOMRange,
} from 'slate-dom'
import { Range } from 'slate'
import { SolidEditor } from '../plugin/solid-editor'
import type { MutableRefObject } from './useRef'
import type { AndroidInputManager } from './android-input-manager/android-input-manager'

export interface UseSyncEditableWeakMapsProps {
  editableRef: MutableRefObject<HTMLDivElement | null>
  editor: Accessor<SolidEditor>
  androidInputManagerRef: MutableRefObject<
    AndroidInputManager | null | undefined
  >
  scrollSelectionIntoView: (editor: SolidEditor, domRange: DOMRange) => void
  state: {
    isDraggingInternally: boolean
    isUpdatingSelection: boolean
    latestElement: DOMElement | null
    hasMarkPlaceholder: boolean
  }
}

export function useSyncEditableWeakMaps({
  editableRef: ref,
  editor,
  androidInputManagerRef,
  scrollSelectionIntoView,
  state,
}: UseSyncEditableWeakMapsProps) {
  // This needs to run in `createEffect` to ensure `ref.current` has been set.
  createEffect(() => {
    // Update element-related weak maps with the DOM element ref.
    let window
    if (ref.current && (window = getDefaultView(ref.current))) {
      EDITOR_TO_WINDOW.set(editor(), window)
      EDITOR_TO_ELEMENT.set(editor(), ref.current)
      NODE_TO_ELEMENT.set(editor(), ref.current)
      ELEMENT_TO_NODE.set(ref.current, editor())
    } else {
      NODE_TO_ELEMENT.delete(editor())
    }

    // Make sure the DOM selection state is in sync.
    const { selection } = editor()
    const root = SolidEditor.findDocumentOrShadowRoot(editor())
    const domSelection = getSelection(root)

    if (
      !domSelection ||
      !SolidEditor.isFocused(editor()) ||
      androidInputManagerRef.current?.hasPendingAction()
    ) {
      return
    }

    const setDomSelection = (forceChange?: boolean) => {
      const hasDomSelection = domSelection.type !== 'None'

      // If the DOM selection is properly unset, we're done.
      if (!selection && !hasDomSelection) {
        return
      }

      // Get anchorNode and focusNode
      const focusNode = domSelection.focusNode
      let anchorNode

      // COMPAT: In firefox the normal seletion way does not work
      // (https://github.com/ianstormtaylor/slate/pull/5486#issue-1820720223)
      if (IS_FIREFOX && domSelection.rangeCount > 1) {
        const firstRange = domSelection.getRangeAt(0)
        const lastRange = domSelection.getRangeAt(domSelection.rangeCount - 1)

        // Right to left
        if (firstRange.startContainer === focusNode) {
          anchorNode = lastRange.endContainer
        } else {
          // Left to right
          anchorNode = firstRange.startContainer
        }
      } else {
        anchorNode = domSelection.anchorNode
      }

      // verify that the dom selection is in the editor
      const editorElement = EDITOR_TO_ELEMENT.get(editor())!
      let hasDomSelectionInEditor = false
      if (
        editorElement.contains(anchorNode) &&
        editorElement.contains(focusNode)
      ) {
        hasDomSelectionInEditor = true
      }

      // If the DOM selection is in the editor and the editor selection is already correct, we're done.
      if (
        hasDomSelection &&
        hasDomSelectionInEditor &&
        selection &&
        !forceChange
      ) {
        const slateRange = SolidEditor.toSlateRange(editor(), domSelection, {
          exactMatch: true,

          // domSelection is not necessarily a valid Slate range
          // (e.g. when clicking on contentEditable:false element)
          suppressThrow: true,
        })

        if (slateRange && Range.equals(slateRange, selection)) {
          if (!state.hasMarkPlaceholder) {
            return
          }

          // Ensure selection is inside the mark placeholder
          if (
            anchorNode?.parentElement?.hasAttribute(
              'data-slate-mark-placeholder'
            )
          ) {
            return
          }
        }
      }

      // when <Editable/> is being controlled through external value
      // then its children might just change - DOM responds to it on its own
      // but Slate's value is not being updated through any operation
      // and thus it doesn't transform selection on its own
      if (selection && !SolidEditor.hasRange(editor(), selection)) {
        editor().selection = SolidEditor.toSlateRange(editor(), domSelection, {
          exactMatch: false,
          suppressThrow: true,
        })
        return
      }

      // Otherwise the DOM selection is out of sync, so update it.
      state.isUpdatingSelection = true

      const newDomRange: DOMRange | null =
        selection && SolidEditor.toDOMRange(editor(), selection)

      if (newDomRange) {
        if (SolidEditor.isComposing(editor()) && !IS_ANDROID) {
          domSelection.collapseToEnd()
        } else if (Range.isBackward(selection!)) {
          domSelection.setBaseAndExtent(
            newDomRange.endContainer,
            newDomRange.endOffset,
            newDomRange.startContainer,
            newDomRange.startOffset
          )
        } else {
          domSelection.setBaseAndExtent(
            newDomRange.startContainer,
            newDomRange.startOffset,
            newDomRange.endContainer,
            newDomRange.endOffset
          )
        }
        scrollSelectionIntoView(editor(), newDomRange)
      } else {
        domSelection.removeAllRanges()
      }

      return newDomRange
    }

    // In firefox if there is more then 1 range and we call setDomSelection we remove the ability to select more cells in a table
    if (domSelection.rangeCount <= 1) {
      setDomSelection()
    }

    const ensureSelection =
      androidInputManagerRef.current?.isFlushing() === 'action'

    if (!IS_ANDROID || !ensureSelection) {
      setTimeout(() => {
        state.isUpdatingSelection = false
      })
      return
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const animationFrameId = requestAnimationFrame(() => {
      if (ensureSelection) {
        const ensureDomSelection = (forceChange?: boolean) => {
          try {
            const el = SolidEditor.toDOMNode(editor(), editor())
            el.focus()

            setDomSelection(forceChange)
          } catch (e) {
            // Ignore, dom and state might be out of sync
          }
        }

        // Compat: Android IMEs try to force their selection by manually re-applying it even after we set it.
        // This essentially would make setting the slate selection during an update meaningless, so we force it
        // again here. We can't only do it in the setTimeout after the animation frame since that would cause a
        // visible flicker.
        ensureDomSelection()

        timeoutId = setTimeout(() => {
          // COMPAT: While setting the selection in an animation frame visually correctly sets the selection,
          // it doesn't update GBoards spellchecker state. We have to manually trigger a selection change after
          // the animation frame to ensure it displays the correct state.
          ensureDomSelection(true)
          state.isUpdatingSelection = false
        })
      }
    })

    return () => {
      cancelAnimationFrame(animationFrameId)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  })
}
