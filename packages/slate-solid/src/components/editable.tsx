import { createEditor, Editor } from 'slate'
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  getDefaultView,
  NODE_TO_ELEMENT,
  type DOMElement,
} from 'slate-dom'
import { createOnDOMSelectionChange } from '../utils/createOnDOMSelectionChange'
import { createEffect } from 'solid-js'
import { useSlate } from '../hooks/use-slate'
import { useRef } from '../hooks/useRef'
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager'

const editor = createEditor()

export interface EditableProps {
  class?: string
  readOnly?: boolean
}

export function Editable({
  class: className,
  readOnly = false,
}: EditableProps) {
  const androidInputManagerRef = useRef<
    AndroidInputManager | null | undefined
  >()
  const editor = useSlate()
  const ref = useRef<HTMLDivElement | null>(null)
  const processing = useRef(false)
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
    readOnly,
    state,
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

  function onInput(
    event: InputEvent & {
      currentTarget: HTMLDivElement
      target: Element
    },
  ) {
    console.log(event)

    switch (event.inputType) {
      case 'insertText':
        Editor.insertText(editor, 'a')
        // Transforms.splitNodes(editor, { always: true })
        console.log(editor)
    }
  }

  return (
    <div
      ref={ref.current!}
      class={className}
      contentEditable
      onInput={onInput}></div>
  )
}
