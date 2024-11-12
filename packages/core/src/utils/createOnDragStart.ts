import type { Accessor, JSX } from 'solid-js'
import { SolidEditor } from '../plugin/solid-editor'
import { Editor, Element, Transforms } from 'slate'
import type { HTMLEvent } from './types'
import { isEventHandled } from './isEventHandled'

export function createOnDragStart({
  editor,
  readOnly,
  state,
  onDragStart,
}: {
  editor: Accessor<Editor>
  readOnly: Accessor<boolean>
  state: {
    isDraggingInternally: boolean
  }
  onDragStart?: JSX.EventHandlerUnion<HTMLDivElement, DragEvent>
}) {
  return (event: HTMLEvent<DragEvent>) => {
    if (
      !readOnly() &&
      SolidEditor.hasTarget(editor(), event.target) &&
      !isEventHandled(event, onDragStart) &&
      event.dataTransfer != null
    ) {
      const node = SolidEditor.toSlateNode(editor(), event.target)
      const path = SolidEditor.findPath(editor(), node)
      const voidMatch =
        (Element.isElement(node) && Editor.isVoid(editor(), node)) ||
        Editor.void(editor(), { at: path, voids: true })

      // If starting a drag on a void node, make sure it is selected
      // so that it shows up in the selection's fragment.
      if (voidMatch) {
        const range = Editor.range(editor(), path)
        Transforms.select(editor(), range)
      }

      state.isDraggingInternally = true

      SolidEditor.setFragmentData(editor(), event.dataTransfer, 'drag')
    }
  }
}
