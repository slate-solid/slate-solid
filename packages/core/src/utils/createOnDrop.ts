import type { Accessor, JSX } from 'solid-js'
import { Editor, Range, Transforms } from 'slate'
import type { HTMLEvent } from './types'
import { SolidEditor } from '../plugin/solid-editor'
import { isEventHandled } from './isEventHandled'
import { setNodeWeakMaps } from './setNodeWeakMaps'

export function createOnDrop({
  editor,
  readOnly,
  state,
  onDrop,
}: {
  editor: Accessor<Editor>
  readOnly: Accessor<boolean>
  state: {
    isDraggingInternally: boolean
  }
  onDrop?: JSX.EventHandlerUnion<HTMLDivElement, DragEvent>
}) {
  return (event: HTMLEvent<DragEvent>) => {
    if (
      !readOnly() &&
      SolidEditor.hasTarget(editor(), event.target) &&
      !isEventHandled(event, onDrop)
    ) {
      event.preventDefault()
      if (event.dataTransfer == null) {
        return
      }

      // Keep a reference to the dragged range before updating selection
      const draggedRange = editor().selection

      // Find the range where the drop happened
      const range = SolidEditor.findEventRange(editor(), event)
      const data = event.dataTransfer

      Transforms.select(editor(), range)

      if (state.isDraggingInternally) {
        if (
          draggedRange &&
          !Range.equals(draggedRange, range) &&
          !Editor.void(editor(), { at: range, voids: true })
        ) {
          Transforms.delete(editor(), {
            at: draggedRange,
          })
        }
      }

      SolidEditor.insertData(editor(), data)
      setNodeWeakMaps(editor())

      // When dragging from another source into the editor, it's possible
      // that the current editor does not have focus.
      if (!SolidEditor.isFocused(editor())) {
        SolidEditor.focus(editor())
      }
    }
  }
}
