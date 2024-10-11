import { Editor, type NodeEntry, Range } from 'slate'
import {
  CAN_USE_DOM,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  getDefaultView,
  HAS_BEFORE_INPUT_SUPPORT,
  NODE_TO_ELEMENT,
  type DOMElement,
  type DOMRange,
} from 'slate-dom'
import { createOnDOMSelectionChange } from '../utils/createOnDOMSelectionChange'
import {
  createEffect,
  createSignal,
  mergeProps,
  splitProps,
  type JSX,
} from 'solid-js'
import debounce from 'lodash/debounce'
import { useSlate } from '../hooks/use-slate'
import { useRef } from '../hooks/useRef'
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager'
import { useChildren } from '../hooks/use-children'
import type {
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
} from './propTypes'
import type { SolidEditor } from '../plugin/solid-editor'
import { defaultDecorate } from '../utils/defaultDecorate'
import { createOnDOMBeforeInput } from '../utils/createOnDOMBeforeInput'
import { useTrackUserInput } from '../hooks/use-track-user-input'
import type { DeferredOperation } from '../utils/types'

const Children = (props: Parameters<typeof useChildren>[0]) => (
  <>{useChildren(props)}</>
)

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
} & JSX.TextareaHTMLAttributes<HTMLDivElement>

export function Editable(origProps: EditableProps) {
  const [namedProps, attributes] = splitProps(origProps, [
    'autofocus',
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

  const props = mergeProps({ readOnly: false }, namedProps)

  const androidInputManagerRef = useRef<
    AndroidInputManager | null | undefined
  >()
  const editor = useSlate()
  // Rerender editor when composition status changed
  const [isComposing, setIsComposing] = createSignal(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const deferredOperations = useRef<DeferredOperation[]>([])
  const processing = useRef(false)
  const { onUserInput, receivedUserInput } = useTrackUserInput()
  const state = {
    isDraggingInternally: false,
    isUpdatingSelection: false,
    latestElement: null as DOMElement | null,
    hasMarkPlaceholder: false,
  }
  createEffect(() => console.log('[TESTING] editor:', editor()))
  const onDOMSelectionChange = createOnDOMSelectionChange({
    editor: editor(),
    androidInputManagerRef,
    processing,
    readOnly: props.readOnly,
    state,
  })

  const scheduleOnDOMSelectionChange = debounce(onDOMSelectionChange, 0)

  const onBeforeInput = createOnDOMBeforeInput({
    editor: editor(),
    androidInputManagerRef,
    deferredOperations,
    processing,
    readOnly: props.readOnly,
    scheduleOnDOMSelectionChange,
    onBeforeInput:
      //TODO: figure out if SolidJS bound functions need to be handled
      typeof props.onDOMBeforeInput === 'function'
        ? (props.onDOMBeforeInput as JSX.InputEventHandler<
            HTMLDivElement,
            InputEvent
          >)
        : undefined,
    onDOMSelectionChange,
    onStopComposing: () => setIsComposing(false),
    onUserInput,
  })

  createEffect(() => {
    window.document.addEventListener('selectionchange', onDOMSelectionChange)
  })

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

  const decorations = (props.decorate ?? defaultDecorate)([editor(), []])

  return (
    <div
      role={props.readOnly ? undefined : 'textbox'}
      aria-multiline={props.readOnly ? undefined : true}
      {...attributes}
      data-slate-editor
      data-slate-node="value"
      // explicitly set this
      contentEditable={!props.readOnly}
      ref={ref.current!}
      onBeforeInput={onBeforeInput}>
      <Children
        decorations={decorations}
        node={editor()}
        renderElement={props.renderElement}
        renderPlaceholder={() => <div>Default Placeholder</div>}
        renderLeaf={props.renderLeaf}
        selection={editor().selection}
      />
    </div>
  )
}
