import { isDOMNode, TRIPLE_CLICK, type DOMEditor } from 'slate-dom'
import { SolidEditor } from '../plugin/solid-editor'
import { Editor, Element, Node, Path, Transforms } from 'slate'
import { isDOMEventHandled } from './isDOMEventHandled'
import type { HTMLMouseEvent, HTMLMouseEventHandler } from './types'

export function createOnClick({
  editor,
  readOnly,
  onClick,
}: {
  editor: DOMEditor
  readOnly: boolean
  onClick?: HTMLMouseEventHandler
}) {
  return (event: HTMLMouseEvent) => {
    if (
      SolidEditor.hasTarget(editor, event.target) &&
      !isDOMEventHandled(event, onClick) &&
      isDOMNode(event.target)
    ) {
      const node = SolidEditor.toSlateNode(editor, event.target)
      const path = SolidEditor.findPath(editor, node)

      // At this time, the Slate document may be arbitrarily different,
      // because onClick handlers can change the document before we get here.
      // Therefore we must check that this path actually exists,
      // and that it still refers to the same node.
      if (!Editor.hasPath(editor, path) || Node.get(editor, path) !== node) {
        return
      }

      if (event.detail === TRIPLE_CLICK && path.length >= 1) {
        let blockPath = path
        if (!(Element.isElement(node) && Editor.isBlock(editor, node))) {
          const block = Editor.above(editor, {
            match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
            at: path,
          })

          blockPath = block?.[1] ?? path.slice(0, 1)
        }

        const range = Editor.range(editor, blockPath)
        Transforms.select(editor, range)
        return
      }

      if (readOnly) {
        return
      }

      const start = Editor.start(editor, path)
      const end = Editor.end(editor, path)
      const startVoid = Editor.void(editor, { at: start })
      const endVoid = Editor.void(editor, { at: end })

      if (startVoid && endVoid && Path.equals(startVoid[1], endVoid[1])) {
        const range = Editor.range(editor, start)
        Transforms.select(editor, range)
      }
    }
  }
}
