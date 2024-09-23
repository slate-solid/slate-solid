import {
  Editor,
  Element,
  Node,
  NodeEntry,
  Path,
  Range,
  Text,
  Transforms,
} from 'slate'
import type { DOMElement, JSX } from 'solid-js/jsx-runtime'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
import { ReactEditor } from '../plugin/react-editor'
import { IS_ANDROID, IS_WEBKIT } from '../utils/environment'
import {
  getActiveElement,
  getSelection,
  type DOMRange,
  type DOMText,
} from '../utils/dom'
import {
  EDITOR_TO_USER_SELECTION,
  IS_COMPOSING,
  IS_FOCUSED,
} from '../utils/weak-maps'
import { useTrackUserInput } from '../hooks/use-track-user-input'
import { useRef } from '../hooks/useRef'
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager'
import { SolidEditor } from '../plugin/solid-editor'
import { createSignal } from 'solid-js'
import { useSlate } from '../hooks/use-slate'
import { ReadOnlyContext } from '../hooks/use-read-only'
import { ComposingContext } from '../hooks/use-composing'
import { DecorateContext } from '../hooks/use-decorate'

type DeferredOperation = () => void

export interface RenderElementProps {
  children: any
  element: Element
  attributes: {
    'data-slate-node': 'element'
    'data-slate-inline'?: true
    'data-slate-void'?: true
    dir?: 'rtl'
    ref: any
  }
}

/**
 * `RenderLeafProps` are passed to the `renderLeaf` handler.
 */

export interface RenderLeafProps {
  children: any
  leaf: Text
  text: Text
  attributes: {
    'data-slate-leaf': true
  }
}

export type EditableProps = {
  decorate?: (entry: NodeEntry) => Range[]
  onDOMBeforeInput?: (event: InputEvent) => void
  placeholder?: string
  readOnly?: boolean
  role?: string
  style?: JSX.CSSProperties
  renderElement?: (props: RenderElementProps) => JSX.Element
  renderLeaf?: (props: RenderLeafProps) => JSX.Element
  renderPlaceholder?: (props: RenderPlaceholderProps) => JSX.Element
  scrollSelectionIntoView?: (editor: ReactEditor, domRange: DOMRange) => void
  // as?: React.ElementType
  disableDefaultStyles?: boolean
} & JSX.TextareaHTMLAttributes<HTMLDivElement>

export function Editable({
  decorate = defaultDecorate,
  onDOMBeforeInput: propsOnDOMBeforeInput,
  readOnly = false,
}: EditableProps) {
  const editor = useSlate()
  // Rerender editor when composition status changed
  const [isComposing, setIsComposing] = createSignal(false)
  const deferredOperations = useRef<DeferredOperation[]>([])
  const processing = useRef(false)
  const { onUserInput, receivedUserInput } = useTrackUserInput()

  // Keep track of some state for the event handler logic.
  const state = {
    isDraggingInternally: false,
    isUpdatingSelection: false,
    latestElement: null as DOMElement | null,
    hasMarkPlaceholder: false,
  }

  /**
   * The AndroidInputManager object has a cyclical dependency on onDOMSelectionChange
   *
   * It is defined as a reference to simplify hook dependencies and clarify that
   * it needs to be initialized.
   */
  const androidInputManagerRef = useRef<
    AndroidInputManager | null | undefined
  >()

  // TODO: This was commented as React specific. Need to determine what to do
  // for SolidJS. For now just using it as is.
  // Listen on the native `selectionchange` event to be able to update any time
  // the selection changes. This is required because React's `onSelect` is leaky
  // and non-standard so it doesn't fire until after a selection has been
  // released. This causes issues in situations where another change happens
  // while a selection is being dragged.
  const onDOMSelectionChange = throttle(() => {
    const el = SolidEditor.toDOMNode(editor, editor)
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
      (IS_ANDROID || !SolidEditor.isComposing(editor)) &&
      (!state.isUpdatingSelection || androidInputManager?.isFlushing()) &&
      !state.isDraggingInternally
    ) {
      const root = SolidEditor.findDocumentOrShadowRoot(editor)
      const { activeElement } = root
      const el = SolidEditor.toDOMNode(editor, editor)
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
        SolidEditor.hasEditableTarget(editor, anchorNode) ||
        SolidEditor.isTargetInsideNonReadonlyVoid(editor, anchorNode)

      const focusNodeInEditor = SolidEditor.hasTarget(editor, focusNode)

      if (anchorNodeSelectable && focusNodeInEditor) {
        const range = SolidEditor.toSlateRange(editor, domSelection, {
          exactMatch: false,
          suppressThrow: true,
        })

        if (range) {
          if (
            !SolidEditor.isComposing(editor) &&
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

  const scheduleOnDOMSelectionChange = debounce(onDOMSelectionChange, 0)

  // Listen on the native `beforeinput` event to get real "Level 2" events. This
  // is required because React's `beforeinput` is fake and never really attaches
  // to the real event sadly. (2019/11/01)
  // https://github.com/facebook/react/issues/11211
  const onDOMBeforeInput = (event: InputEvent) => {
    const el = SolidEditor.toDOMNode(editor, editor)
    const root = el.getRootNode()

    if (processing.current && IS_WEBKIT && root instanceof ShadowRoot) {
      const ranges = event.getTargetRanges()
      const range = ranges[0]

      const newRange = new window.Range()

      newRange.setStart(range.startContainer, range.startOffset)
      newRange.setEnd(range.endContainer, range.endOffset)

      // Translate the DOM Range into a Slate Range
      const slateRange = SolidEditor.toSlateRange(editor, newRange, {
        exactMatch: false,
        suppressThrow: false,
      })

      Transforms.select(editor, slateRange)

      event.preventDefault()
      event.stopImmediatePropagation()
      return
    }
    onUserInput()

    if (
      !readOnly &&
      SolidEditor.hasEditableTarget(editor, event.target) &&
      !isDOMEventHandled(event, propsOnDOMBeforeInput)
    ) {
      // COMPAT: BeforeInput events aren't cancelable on android, so we have to handle them differently using the android input manager.
      if (androidInputManagerRef.current) {
        return androidInputManagerRef.current.handleDOMBeforeInput(event)
      }

      // Some IMEs/Chrome extensions like e.g. Grammarly set the selection immediately before
      // triggering a `beforeinput` expecting the change to be applied to the immediately before
      // set selection.
      scheduleOnDOMSelectionChange.flush()
      onDOMSelectionChange.flush()

      const { selection } = editor
      const { inputType: type } = event
      const data = (event as any).dataTransfer || event.data || undefined

      const isCompositionChange =
        type === 'insertCompositionText' || type === 'deleteCompositionText'

      // COMPAT: use composition change events as a hint to where we should insert
      // composition text if we aren't composing to work around https://github.com/ianstormtaylor/slate/issues/5038
      if (isCompositionChange && SolidEditor.isComposing(editor)) {
        return
      }

      let native = false
      if (
        type === 'insertText' &&
        selection &&
        Range.isCollapsed(selection) &&
        // Only use native character insertion for single characters a-z or space for now.
        // Long-press events (hold a + press 4 = ä) to choose a special character otherwise
        // causes duplicate inserts.
        event.data &&
        event.data.length === 1 &&
        /[a-z ]/i.test(event.data) &&
        // Chrome has issues correctly editing the start of nodes: https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
        // When there is an inline element, e.g. a link, and you select
        // right after it (the start of the next node).
        selection.anchor.offset !== 0
      ) {
        native = true

        // Skip native if there are marks, as
        // `insertText` will insert a node, not just text.
        if (editor.marks) {
          native = false
        }

        // Chrome also has issues correctly editing the end of anchor elements: https://bugs.chromium.org/p/chromium/issues/detail?id=1259100
        // Therefore we don't allow native events to insert text at the end of anchor nodes.
        const { anchor } = selection

        const [node, offset] = SolidEditor.toDOMPoint(editor, anchor)
        const anchorNode = node.parentElement?.closest('a')

        const window = SolidEditor.getWindow(editor)

        if (
          native &&
          anchorNode &&
          SolidEditor.hasDOMNode(editor, anchorNode)
        ) {
          // Find the last text node inside the anchor.
          const lastText = window?.document
            .createTreeWalker(anchorNode, NodeFilter.SHOW_TEXT)
            .lastChild() as DOMText | null

          if (lastText === node && lastText.textContent?.length === offset) {
            native = false
          }
        }

        // Chrome has issues with the presence of tab characters inside elements with whiteSpace = 'pre'
        // causing abnormal insert behavior: https://bugs.chromium.org/p/chromium/issues/detail?id=1219139
        if (
          native &&
          node.parentElement &&
          window?.getComputedStyle(node.parentElement)?.whiteSpace === 'pre'
        ) {
          const block = Editor.above(editor, {
            at: anchor.path,
            match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
          })

          if (block && Node.string(block[0]).includes('\t')) {
            native = false
          }
        }
      }

      // COMPAT: For the deleting forward/backward input types we don't want
      // to change the selection because it is the range that will be deleted,
      // and those commands determine that for themselves.
      if (!type.startsWith('delete') || type.startsWith('deleteBy')) {
        const [targetRange] = (event as any).getTargetRanges()

        if (targetRange) {
          const range = SolidEditor.toSlateRange(editor, targetRange, {
            exactMatch: false,
            suppressThrow: false,
          })

          if (!selection || !Range.equals(selection, range)) {
            native = false

            const selectionRef =
              !isCompositionChange &&
              editor.selection &&
              Editor.rangeRef(editor, editor.selection)

            Transforms.select(editor, range)

            if (selectionRef) {
              EDITOR_TO_USER_SELECTION.set(editor, selectionRef)
            }
          }
        }
      }

      // Composition change types occur while a user is composing text and can't be
      // cancelled. Let them through and wait for the composition to end.
      if (isCompositionChange) {
        return
      }

      if (!native) {
        event.preventDefault()
      }

      // COMPAT: If the selection is expanded, even if the command seems like
      // a delete forward/backward command it should delete the selection.
      if (
        selection &&
        Range.isExpanded(selection) &&
        type.startsWith('delete')
      ) {
        const direction = type.endsWith('Backward') ? 'backward' : 'forward'
        Editor.deleteFragment(editor, { direction })
        return
      }

      switch (type) {
        case 'deleteByComposition':
        case 'deleteByCut':
        case 'deleteByDrag': {
          Editor.deleteFragment(editor)
          break
        }

        case 'deleteContent':
        case 'deleteContentForward': {
          Editor.deleteForward(editor)
          break
        }

        case 'deleteContentBackward': {
          Editor.deleteBackward(editor)
          break
        }

        case 'deleteEntireSoftLine': {
          Editor.deleteBackward(editor, { unit: 'line' })
          Editor.deleteForward(editor, { unit: 'line' })
          break
        }

        case 'deleteHardLineBackward': {
          Editor.deleteBackward(editor, { unit: 'block' })
          break
        }

        case 'deleteSoftLineBackward': {
          Editor.deleteBackward(editor, { unit: 'line' })
          break
        }

        case 'deleteHardLineForward': {
          Editor.deleteForward(editor, { unit: 'block' })
          break
        }

        case 'deleteSoftLineForward': {
          Editor.deleteForward(editor, { unit: 'line' })
          break
        }

        case 'deleteWordBackward': {
          Editor.deleteBackward(editor, { unit: 'word' })
          break
        }

        case 'deleteWordForward': {
          Editor.deleteForward(editor, { unit: 'word' })
          break
        }

        case 'insertLineBreak':
          Editor.insertSoftBreak(editor)
          break

        case 'insertParagraph': {
          Editor.insertBreak(editor)
          break
        }

        case 'insertFromComposition':
        case 'insertFromDrop':
        case 'insertFromPaste':
        case 'insertFromYank':
        case 'insertReplacementText':
        case 'insertText': {
          if (type === 'insertFromComposition') {
            // COMPAT: in Safari, `compositionend` is dispatched after the
            // `beforeinput` for "insertFromComposition". But if we wait for it
            // then we will abort because we're still composing and the selection
            // won't be updated properly.
            // https://www.w3.org/TR/input-events-2/
            if (SolidEditor.isComposing(editor)) {
              setIsComposing(false)
              IS_COMPOSING.set(editor, false)
            }
          }

          // use a weak comparison instead of 'instanceof' to allow
          // programmatic access of paste events coming from external windows
          // like cypress where cy.window does not work realibly
          if (data?.constructor.name === 'DataTransfer') {
            SolidEditor.insertData(editor, data)
          } else if (typeof data === 'string') {
            // Only insertText operations use the native functionality, for now.
            // Potentially expand to single character deletes, as well.
            if (native) {
              deferredOperations.current.push(() =>
                Editor.insertText(editor, data),
              )
            } else {
              Editor.insertText(editor, data)
            }
          }

          break
        }
      }

      // Restore the actual user section if nothing manually set it.
      const toRestore = EDITOR_TO_USER_SELECTION.get(editor)?.unref()
      EDITOR_TO_USER_SELECTION.delete(editor)

      if (
        toRestore &&
        (!editor.selection || !Range.equals(editor.selection, toRestore))
      ) {
        Transforms.select(editor, toRestore)
      }
    }
  }

  return (
    <ReadOnlyContext.Provider value={readOnly}>
      <ComposingContext.Provider value={isComposing()}>
        <DecorateContext.Provider value={decorate}>
          {/* <RestoreDOM
            node={ref}
            receivedUserInput={receivedUserInput}> */}

          {/* </RestoreDOM> */}
        </DecorateContext.Provider>
      </ComposingContext.Provider>
    </ReadOnlyContext.Provider>
  )
}

// This is copied from `React` types. TBD whether we actually need it.
// Bivariance hack for consistent unsoundness with RefObject
type RefCallback<T> = {
  bivarianceHack(instance: T | null): void
}['bivarianceHack']

/**
 * The props that get passed to renderPlaceholder
 */
export type RenderPlaceholderProps = {
  children: any
  attributes: {
    'data-slate-placeholder': boolean
    dir?: 'rtl'
    contentEditable: boolean
    ref: RefCallback<any>
    style: JSX.CSSProperties
  }
}

/**
 * A default memoized decorate function.
 */

export const defaultDecorate: (entry: NodeEntry) => Range[] = () => []

/**
 * Check if a DOM event is overrided by a handler.
 */

export const isDOMEventHandled = <E extends Event>(
  event: E,
  handler?: (event: E) => void | boolean,
) => {
  if (!handler) {
    return false
  }

  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event)

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled
  }

  return event.defaultPrevented
}
