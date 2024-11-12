import type { Accessor, JSX } from 'solid-js'
import type { HTMLEvent } from './types'
import { SolidEditor } from '../plugin/solid-editor'
import { Editor, Node, Range, Transforms } from 'slate'
import { isEventHandled } from './isEventHandled'
import { isDOMEventTargetInput } from './isDOMEventTargetInput'

export function createOnCut({
  editor,
  readOnly,
  onCut,
}: {
  editor: Accessor<Editor>
  readOnly: Accessor<boolean>
  onCut?: JSX.EventHandlerUnion<HTMLDivElement, ClipboardEvent>
}) {
  return (event: HTMLEvent<ClipboardEvent>) => {
    if (
      !readOnly() &&
      SolidEditor.hasSelectableTarget(editor(), event.target) &&
      !isEventHandled(event, onCut) &&
      !isDOMEventTargetInput(event)
    ) {
      event.preventDefault()
      if (event.clipboardData == null) {
        return
      }

      SolidEditor.setFragmentData(editor(), event.clipboardData, 'cut')
      const { selection } = editor()

      if (selection) {
        if (Range.isExpanded(selection)) {
          Editor.deleteFragment(editor())
        } else {
          const node = Node.parent(editor(), selection.anchor.path)
          if (Editor.isVoid(editor(), node)) {
            Transforms.delete(editor())
          }
        }
      }
    }
  }
}
