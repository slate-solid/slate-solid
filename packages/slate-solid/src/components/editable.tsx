import { createEditor, Editor, Transforms } from 'slate'
import { getSelection } from 'slate-dom'
import { SolidEditor } from '../plugin/solid-editor'

const editor = createEditor()

export interface EditableProps {
  class?: string
}

export function Editable({ class: className }: EditableProps) {
  return <div class={className} contentEditable onInput={onInput}></div>

  // TODO: selection handling needs to happen for text manipulation to work

  function onInput(
    event: InputEvent & {
      currentTarget: HTMLDivElement
      target: Element
    },
  ) {
    console.log(event)

    switch (event.inputType) {
      case 'insertText':
        // TODO: selection snould be handled in selection handler
        const root = SolidEditor.findDocumentOrShadowRoot(editor)
        const domSelection = getSelection(root)
        const range = SolidEditor.toSlateRange(editor, domSelection!, {
          exactMatch: false,
          suppressThrow: true,
        })
        Transforms.select(editor, range)

        Editor.insertText(editor, 'a')
        // Transforms.splitNodes(editor, { always: true })
        console.log(editor)
    }
  }
}
