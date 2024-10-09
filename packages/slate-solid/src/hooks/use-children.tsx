import type { JSX } from 'solid-js'
import { Ancestor, Descendant, Editor, Element, Range } from 'slate'
import type {
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
} from '../components/propTypes'

import ElementComponent from '../components/element'
import TextComponent from '../components/text'
import { SolidEditor } from '../plugin/solid-editor'
import { NODE_TO_INDEX, NODE_TO_PARENT } from 'slate-dom'
import { useDecorate } from './use-decorate'
import { SelectedContext } from './use-selected'
import { useSlateStatic } from './use-slate-static'

/**
 * Children.
 */

export const useChildren = (props: {
  decorations: Range[]
  node: Ancestor
  renderElement?: (props: RenderElementProps) => JSX.Element
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
  renderLeaf?: (props: RenderLeafProps) => JSX.Element
  selection: Range | null
}) => {
  console.log('[TESTING] useChildren start')
  const {
    decorations,
    node,
    renderElement,
    renderPlaceholder,
    renderLeaf,
    selection,
  } = props
  const decorate = useDecorate()
  const editor = useSlateStatic()
  const path = SolidEditor.findPath(editor, node)
  const children = []
  const isLeafBlock =
    Element.isElement(node) &&
    !editor.isInline(node) &&
    Editor.hasInlines(editor, node)

  for (let i = 0; i < node.children.length; i++) {
    const p = path.concat(i)
    const n = node.children[i] as Descendant
    const key = SolidEditor.findKey(editor, n)
    const range = Editor.range(editor, p)
    const sel = selection && Range.intersection(range, selection)
    const ds = decorate([n, p])

    for (const dec of decorations) {
      const d = Range.intersection(dec, range)

      if (d) {
        ds.push(d)
      }
    }

    // In React, these 2 calls happen after building the children array, but in
    // Solid, the ElementComponent component function gets called before this
    // hook exits which recursively calls `useChildren`. We need the WeakMaps to
    // be set first.
    NODE_TO_INDEX.set(n, i)
    NODE_TO_PARENT.set(n, node)

    if (Element.isElement(n)) {
      children.push(
        <SelectedContext.Provider
          // key={`provider-${key.id}`}
          value={!!sel}>
          <ElementComponent
            decorations={ds}
            element={n}
            // key={key.id}
            renderElement={renderElement}
            renderPlaceholder={renderPlaceholder}
            renderLeaf={renderLeaf}
            selection={sel}
          />
        </SelectedContext.Provider>,
      )
    } else {
      children.push(
        <TextComponent
          decorations={ds}
          // key={key.id}
          isLast={isLeafBlock && i === node.children.length - 1}
          parent={node}
          renderPlaceholder={renderPlaceholder}
          renderLeaf={renderLeaf}
          text={n}
        />,
      )
    }
  }
  console.log('[TESTING] useChildren end')
  return children
}

export default useChildren
