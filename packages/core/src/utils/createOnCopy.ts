import type { Accessor, JSX } from 'solid-js'
import type { Editor } from 'slate'
import { isEventHandled } from './isEventHandled'
import type { HTMLEvent } from './types'
import { SolidEditor } from '../plugin/solid-editor'
import { isDOMEventTargetInput } from './isDOMEventTargetInput'

export function createOnCopy({
  editor,
  onCopy,
}: {
  editor: Accessor<Editor>
  onCopy?: JSX.EventHandlerUnion<HTMLDivElement, ClipboardEvent>
}) {
  return (event: HTMLEvent<ClipboardEvent>) => {
    if (
      SolidEditor.hasSelectableTarget(editor(), event.target) &&
      !isEventHandled(event, onCopy) &&
      !isDOMEventTargetInput(event)
    ) {
      event.preventDefault()
      if (event.clipboardData == null) {
        return
      }
      SolidEditor.setFragmentData(editor(), event.clipboardData, 'copy')
    }
  }
}
