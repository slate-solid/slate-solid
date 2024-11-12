import type { Accessor, JSX } from 'solid-js'
import type { HTMLEvent } from './types'
import type { Editor } from 'slate'
import { SolidEditor } from '../plugin/solid-editor'

export function createOnDragEnd({
  editor,
  readOnly,
  state,
  onDragEnd,
}: {
  editor: Accessor<Editor>
  readOnly: Accessor<boolean>
  state: {
    isDraggingInternally: boolean
  }
  onDragEnd?: JSX.EventHandlerUnion<HTMLDivElement, DragEvent>
}) {
  return (event: HTMLEvent<DragEvent>) => {
    if (
      !readOnly() &&
      state.isDraggingInternally &&
      onDragEnd &&
      SolidEditor.hasTarget(editor(), event.target)
    ) {
      // TODO: Determine if we need to handle SolidJS bound events
      if (typeof onDragEnd !== 'function') {
        return
      }

      onDragEnd(event)
    }
  }
}
