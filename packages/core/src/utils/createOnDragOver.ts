import { Editor, Element } from 'slate'
import { SolidEditor } from '../plugin/solid-editor'
import type { HTMLEvent } from './types'
import type { Accessor, JSX } from 'solid-js'
import { isEventHandled } from './isEventHandled'

export function createOnDragOver({
  editor,
  onDragOver,
}: {
  editor: Accessor<Editor>
  onDragOver?: JSX.EventHandlerUnion<HTMLDivElement, DragEvent>
}) {
  return (event: HTMLEvent<DragEvent>) => {
    if (
      SolidEditor.hasTarget(editor(), event.target) &&
      !isEventHandled(event, onDragOver)
    ) {
      // Only when the target is void, call `preventDefault` to signal
      // that drops are allowed. Editable content is droppable by
      // default, and calling `preventDefault` hides the cursor.
      const node = SolidEditor.toSlateNode(editor(), event.target)

      if (Element.isElement(node) && Editor.isVoid(editor(), node)) {
        event.preventDefault()
      }
    }
  }
}
