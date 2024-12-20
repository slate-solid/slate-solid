import debounce from 'lodash/debounce'
import { Editor, Node, Range, type NodeEntry, Text } from 'slate'
import {
  CAN_USE_DOM,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  HAS_BEFORE_INPUT_SUPPORT,
  MARK_PLACEHOLDER_SYMBOL,
  NODE_TO_ELEMENT,
  PLACEHOLDER_SYMBOL,
  getDefaultView,
  type DOMElement,
  type DOMRange,
} from 'slate-dom'
import {
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
  splitProps,
  type JSX,
} from 'solid-js'
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager'
import { ComposingContext } from '../hooks/useComposing'
import { DecorateContext } from '../hooks/useDecorate'
import { ReadOnlyContext } from '../hooks/useReadOnly'
import { useRef } from '../hooks/useRef'
import { useSlate } from '../hooks/useSlate'
import { useSyncEditableWeakMaps } from '../hooks/useSyncEditableWeakMaps'
import { useTrackUserInput } from '../hooks/useTrackUserInput'
import { SolidEditor } from '../plugin/solid-editor'
import { createOnBlur } from '../utils/createOnBlur'
import { createOnClick } from '../utils/createOnClick'
import { createOnCompositionEnd } from '../utils/createOnCompositionEnd'
import { createOnCompositionStart } from '../utils/createOnCompositionStart'
import { createOnCompositionUpdate } from '../utils/createOnCompositionUpdate'
import { createOnDOMBeforeInput } from '../utils/createOnDOMBeforeInput'
import { createOnDOMSelectionChange } from '../utils/createOnDOMSelectionChange'
import { createOnFocus } from '../utils/createOnFocus'
import { createOnInput } from '../utils/createOnInput'
import { createOnKeyDown } from '../utils/createOnKeyDown'
import { defaultDecorate } from '../utils/defaultDecorate'
import { defaultScrollSelectionIntoView } from '../utils/defaultScrollSelectionIntoView'
import { Logger } from '../utils/logger'
import type { DeferredOperation } from '../utils/types'
import { Children } from './children'
import { DefaultPlaceholder } from './defaultPlaceholder'
import type {
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
} from './propTypes'
import { RerenderOnSignal } from './rerenderOnSignal'
import { isArrayEqual } from '../utils/isEqual'
import { createOnCopy } from '../utils/createOnCopy'
import { createOnCut } from '../utils/createOnCut'
import { createOnPaste } from '../utils/createOnPaste'
import { createOnDragStart } from '../utils/createOnDragStart'
import { createOnDrop } from '../utils/createOnDrop'
import { createOnDragEnd } from '../utils/createOnDragEnd'
import { createOnDragOver } from '../utils/createOnDragOver'

const logger = new Logger('Editable')

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
  scrollSelectionIntoView?: (editor: SolidEditor, domRange: DOMRange) => void
  // as?: React.ElementType
  disableDefaultStyles?: boolean
} & Omit<JSX.TextareaHTMLAttributes<HTMLDivElement>, 'style'>

export function Editable(origProps: EditableProps) {
  const [namedProps, attributes] = splitProps(origProps, [
    'decorate',
    'onDOMBeforeInput',
    'placeholder',
    'readOnly',
    'renderElement',
    'renderLeaf',
    'renderPlaceholder',
    'scrollSelectionIntoView',
    'style',
    'disableDefaultStyles',
  ])

  const props = mergeProps(
    {
      decorate: defaultDecorate,
      disableDefaultStyles: false,
      readOnly: false,
      renderPlaceholder: (props: RenderPlaceholderProps) => (
        <DefaultPlaceholder {...props} />
      ),
      scrollSelectionIntoView: defaultScrollSelectionIntoView,
      style: {},
    },
    namedProps,
  )

  const androidInputManagerRef = useRef<
    AndroidInputManager | null | undefined
  >()

  const editor = useSlate()
  const selection = createMemo(() => editor().selection)

  createEffect(() => {
    logger.groupCollapsed('editor()')
    logger.debug('selection:', JSON.stringify(selection()))
    logger.debug('children:', JSON.stringify(editor().children, undefined, 2))
    logger.groupEnd()
  })

  // Rerender editor when composition status changed
  const [isComposing, setIsComposing] = createSignal(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const deferredOperations = useRef<DeferredOperation[]>([])
  const [placeholderHeight, setPlaceholderHeight] = createSignal<
    number | undefined
  >()
  const processing = useRef(false)
  const { onUserInput, receivedUserInput } = useTrackUserInput()
  const state = {
    isDraggingInternally: false,
    isUpdatingSelection: false,
    latestElement: null as DOMElement | null,
    hasMarkPlaceholder: false,
  }
  const onDOMSelectionChange = createOnDOMSelectionChange({
    editor: editor(),
    androidInputManagerRef,
    processing,
    readOnly: props.readOnly,
    state,
  })

  const scheduleOnDOMSelectionChange = debounce(onDOMSelectionChange, 0)

  useSyncEditableWeakMaps({
    editableRef: ref,
    editor,
    androidInputManagerRef,
    scrollSelectionIntoView: props.scrollSelectionIntoView,
    state,
  })

  const onBeforeInput = createOnDOMBeforeInput({
    editor: editor(),
    androidInputManagerRef,
    deferredOperations,
    processing,
    readOnly: props.readOnly,
    scheduleOnDOMSelectionChange,
    onBeforeInput: props.onDOMBeforeInput,
    onDOMSelectionChange,
    onStopComposing: () => setIsComposing(false),
    onUserInput,
  })

  const onBlur = createOnBlur({
    editor,
    readOnly: () => props.readOnly,
    state,
    onBlur: attributes.onBlur,
  })

  const onClick = createOnClick({
    editor: editor(),
    readOnly: props.readOnly,
    onClick: attributes.onClick,
  })

  const onCompositionEnd = createOnCompositionEnd({
    androidInputManagerRef,
    editor,
    onCompositionEnd: attributes.onCompositionEnd,
    onStopComposing: () => setIsComposing(false),
  })

  const onCompositionStart = createOnCompositionStart({
    androidInputManagerRef,
    editor,
    onCompositionStart: attributes.onCompositionStart,
    onStartComposing: () => setIsComposing(true),
  })

  const onCompositionUpdate = createOnCompositionUpdate({
    editor,
    onCompositionUpdate: attributes.onCompositionUpdate,
    onStartComposing: () => setIsComposing(true),
  })

  const onCopy = createOnCopy({
    editor,
    onCopy: attributes.onCopy,
  })

  const onCut = createOnCut({
    editor,
    readOnly: () => props.readOnly,
    onCut: attributes.onCut,
  })

  const onDragEnd = createOnDragEnd({
    editor,
    readOnly: () => props.readOnly,
    state,
    onDragEnd: attributes.onDragEnd,
  })

  const onDragStart = createOnDragStart({
    editor,
    readOnly: () => props.readOnly,
    state,
    onDragStart: attributes.onDragStart,
  })

  const onDragOver = createOnDragOver({
    editor,
    onDragOver: attributes.onDragOver,
  })

  const onDrop = createOnDrop({
    editor,
    readOnly: () => props.readOnly,
    state,
    onDrop: attributes.onDrop,
  })

  const onFocus = createOnFocus({
    editor,
    readOnly: () => props.readOnly,
    state,
    onFocus: attributes.onFocus,
  })

  const onInput = createOnInput({
    androidInputManagerRef,
    deferredOperations,
    onInput: attributes.onInput,
  })

  const onKeyDown = createOnKeyDown({
    editor,
    androidInputManagerRef,
    readOnly: () => props.readOnly,
    onKeyDown: attributes.onKeyDown,
    onStopComposing: () => setIsComposing(false),
  })

  const onPaste = createOnPaste({
    editor,
    readOnly: () => props.readOnly,
    onPaste: attributes.onPaste,
  })

  // Listen for dragend and drop globally. In Firefox, if a drop handler
  // initiates an operation that causes the originally dragged element to
  // unmount, that element will not emit a dragend event. (2024/06/21)
  const onStoppedDragging = () => {
    state.isDraggingInternally = false
  }

  onMount(() => {
    const window = SolidEditor.getWindow(editor())
    window.document.addEventListener(
      'selectionchange',
      scheduleOnDOMSelectionChange,
    )

    if (ref.current && attributes.autofocus) {
      ref.current.focus()
    }

    window.document.addEventListener('dragend', onStoppedDragging)
    window.document.addEventListener('drop', onStoppedDragging)
  })

  onCleanup(() => {
    const window = SolidEditor.getWindow(editor())
    window.document.removeEventListener(
      'selectionchange',
      scheduleOnDOMSelectionChange,
    )

    window.document.removeEventListener('dragend', onStoppedDragging)
    window.document.removeEventListener('drop', onStoppedDragging)
  })

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
  })

  const showPlaceholder = createMemo(
    () =>
      props.placeholder &&
      editor().children.length === 1 &&
      Array.from(Node.texts(editor())).length === 1 &&
      Node.string(editor()) === '' &&
      !isComposing(),
  )

  const placeHolderResizeHandler = (placeholderEl: HTMLElement | null) => {
    if (placeholderEl && showPlaceholder()) {
      setPlaceholderHeight(placeholderEl.getBoundingClientRect()?.height)
    } else {
      setPlaceholderHeight(undefined)
    }
  }

  const decorations = createMemo(
    () => {
      const decorations = props.decorate([editor(), []])

      if (showPlaceholder()) {
        const start = Editor.start(editor(), [])
        decorations.push({
          [PLACEHOLDER_SYMBOL]: true,
          placeholder: props.placeholder,
          onPlaceholderResize: placeHolderResizeHandler,
          anchor: start,
          focus: start,
        })
      }

      const { marks, selection } = editor()
      state.hasMarkPlaceholder = false

      if (selection && Range.isCollapsed(selection) && marks) {
        const { anchor } = selection
        const leaf = Node.leaf(editor(), anchor.path)
        const { text: _, ...rest } = leaf

        // While marks isn't a 'complete' text, we can still use loose Text.equals
        // here which only compares marks anyway.
        if (!Text.equals(leaf, marks as Text, { loose: true })) {
          state.hasMarkPlaceholder = true

          const unset = Object.fromEntries(
            Object.keys(rest).map(mark => [mark, null]),
          )

          decorations.push({
            [MARK_PLACEHOLDER_SYMBOL]: true,
            ...unset,
            ...marks,

            anchor,
            focus: anchor,
          })
        }
      }

      return decorations
    },
    undefined,
    { equals: isArrayEqual },
  )

  const style = createMemo<JSX.CSSProperties>(() => ({
    ...(props.disableDefaultStyles
      ? {}
      : {
          // Allow positioning relative to the editable element.
          position: 'relative',
          // Preserve adjacent whitespace and new lines.
          'white-space': 'pre-wrap',
          // Allow words to break if they are too long.
          'word-wrap': 'break-word',
          // Make the minimum height that of the placeholder.
          ...(placeholderHeight()
            ? { 'min-height': `${placeholderHeight()}px` }
            : {}),
        }),
    // Allow for passed-in styles to override anything.
    ...props.style,
  }))

  return (
    <ReadOnlyContext.Provider value={() => props.readOnly}>
      <ComposingContext.Provider value={isComposing}>
        <RerenderOnSignal signal={isComposing}>
          <DecorateContext.Provider value={props.decorate}>
            {/* TODO: RestoreDOM */}
            {/* <RestoreDOM node={ref} receivedUserInput={receivedUserInput}> */}
            <div
              role={props.readOnly ? undefined : 'textbox'}
              aria-multiline={props.readOnly ? undefined : true}
              {...attributes}
              // COMPAT: Certain browsers don't support the `beforeinput` event, so we'd
              // have to use hacks to make these replacement-based features work.
              // For SSR situations HAS_BEFORE_INPUT_SUPPORT is false and results in prop
              // mismatch warning app moves to browser. Pass-through consumer props when
              // not CAN_USE_DOM (SSR) and default to falsy value
              spellcheck={
                HAS_BEFORE_INPUT_SUPPORT || !CAN_USE_DOM
                  ? attributes.spellcheck
                  : false
              }
              // @ts-expect-error autocorrect is not included in the types
              autocorrect={
                HAS_BEFORE_INPUT_SUPPORT || !CAN_USE_DOM
                  ? // @ts-expect-error autocorrect is not included in the types
                    attributes.autocorrect
                  : 'false'
              }
              autocapitalize={
                HAS_BEFORE_INPUT_SUPPORT || !CAN_USE_DOM
                  ? attributes.autocapitalize
                  : 'off'
              }
              data-slate-editor
              data-slate-node="value"
              // explicitly set this
              contentEditable={!props.readOnly}
              // in some cases, a decoration needs access to the range / selection to decorate a text node,
              // then you will select the whole text node when you select part the of text
              // this magic zIndex="-1" will fix it
              zindex={-1}
              ref={node => {
                if (node == null) {
                  onDOMSelectionChange.cancel()
                  scheduleOnDOMSelectionChange.cancel()

                  EDITOR_TO_ELEMENT.delete(editor())
                  NODE_TO_ELEMENT.delete(editor())
                }

                ref.current = node

                // TODO: Implement forward ref for ref passed into Editable
              }}
              style={style()}
              onBeforeInput={onBeforeInput}
              onBlur={onBlur}
              onClick={onClick}
              onCompositionEnd={onCompositionEnd}
              onCompositionStart={onCompositionStart}
              onCompositionUpdate={onCompositionUpdate}
              onCopy={onCopy}
              onCut={onCut}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDragStart={onDragStart}
              onDrop={onDrop}
              onFocus={onFocus}
              onInput={onInput}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
            >
              <Children
                decorations={decorations()}
                node={editor()}
                renderElement={props.renderElement}
                renderPlaceholder={props.renderPlaceholder}
                renderLeaf={props.renderLeaf}
                selection={selection}
              />
            </div>
            {/* </RestoreDOM> */}
          </DecorateContext.Provider>
        </RerenderOnSignal>
      </ComposingContext.Provider>
    </ReadOnlyContext.Provider>
  )
}
