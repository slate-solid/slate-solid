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
import { createEffect, createSignal, splitProps, type JSX } from 'solid-js'
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
import {
  createOnDOMBeforeInput,
  type DeferredOperation,
} from '../utils/createOnDOMBeforeInput'
import { useTrackUserInput } from '../hooks/use-track-user-input'

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

export function Editable(props: EditableProps) {
  const [namedProps, attributes] = splitProps(props, [
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

  console.log('[TESTING] Editable')
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

  const onDOMSelectionChange = createOnDOMSelectionChange({
    editor,
    androidInputManagerRef,
    processing,
    readOnly: props.readOnly ?? false,
    state,
  })

  const scheduleOnDOMSelectionChange = debounce(onDOMSelectionChange, 0)

  const onBeforeInput = createOnDOMBeforeInput({
    editor,
    androidInputManagerRef,
    deferredOperations,
    processing,
    readOnly: props.readOnly ?? false,
    scheduleOnDOMSelectionChange,
    onBeforeInput:
      //TODO: figure out if SolidJS bound functions need to be handled
      typeof props.onBeforeInput === 'function'
        ? (props.onBeforeInput as JSX.InputEventHandler<
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
      EDITOR_TO_WINDOW.set(editor, window)
      EDITOR_TO_ELEMENT.set(editor, ref.current)
      NODE_TO_ELEMENT.set(editor, ref.current)
      ELEMENT_TO_NODE.set(ref.current, editor)
    } else {
      NODE_TO_ELEMENT.delete(editor)
    }
  })

  // function onInput(
  //   event: InputEvent & {
  //     currentTarget: HTMLDivElement
  //     target: Element
  //   },
  // ) {
  //   console.log(event)

  //   switch (event.inputType) {
  //     case 'insertText':
  //       Editor.insertText(editor, 'a')
  //       // Transforms.splitNodes(editor, { always: true })

  //       console.log(
  //         '[TESTING] selection',
  //         JSON.stringify(editor.selection, undefined, 2),
  //       )

  //       console.log(
  //         '[TESTING] insertText',
  //         JSON.stringify(editor.children, undefined, 2),
  //       )
  //   }
  // }

  const decorations = (props.decorate ?? defaultDecorate)([editor, []])

  return (
    <div
      class={props.class}
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
        node={editor}
        renderElement={props.renderElement}
        renderPlaceholder={() => <div>Default Placeholder</div>}
        renderLeaf={props.renderLeaf}
        selection={editor.selection}
      />
    </div>
  )
}
