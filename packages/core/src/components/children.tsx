import { createMemo, For, type Accessor, type JSX } from 'solid-js'
import { type Ancestor, Range, Editor, Element } from 'slate'
import type {
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
} from './propTypes'
import ElementComponent from '../components/element'
import TextComponent from '../components/text'
import { useDecorate } from '../hooks/useDecorate'
import { useSlateStatic } from '../hooks/useSlateStatic'
import { SelectedContext } from '../hooks/useSelected'
import { NODE_TO_PATH } from '../utils/weakMaps'

export interface ChildrenProps {
  decorations: Range[]
  node: Ancestor
  renderElement?: (props: RenderElementProps) => JSX.Element
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
  renderLeaf?: (props: RenderLeafProps) => JSX.Element
  selection: Accessor<Range | null>
}

export function Children(props: ChildrenProps) {
  const decorate = useDecorate()
  const editor = useSlateStatic()

  const isLeafBlock = () =>
    Element.isElement(props.node) &&
    !editor().isInline(props.node) &&
    Editor.hasInlines(editor(), props.node)

  return (
    <For each={props.node.children}>
      {(n, i) => {
        const childPath = () => NODE_TO_PATH.get(n)!

        // const key = SolidEditor.findKey(editor(), n)
        const range = createMemo(() => Editor.range(editor(), childPath()))

        const sel = () =>
          props.selection() && Range.intersection(range(), props.selection()!)
        const hasSel = () => !!sel()

        const ds = createMemo(() => {
          const ds = decorate([n, childPath()])

          for (const dec of props.decorations) {
            const d = Range.intersection(dec, range())

            if (d) {
              ds.push(d)
            }
          }

          return ds
        })

        return (
          <>
            {Element.isElement(n) ? (
              <SelectedContext.Provider
                // key={`provider-${key.id}`}
                value={hasSel}
              >
                <ElementComponent
                  decorations={ds()}
                  element={n}
                  // key={key.id}
                  renderElement={props.renderElement}
                  renderPlaceholder={props.renderPlaceholder}
                  renderLeaf={props.renderLeaf}
                  selection={sel()}
                />
              </SelectedContext.Provider>
            ) : (
              <TextComponent
                decorations={ds()}
                // key={key.id}
                isLast={isLeafBlock() && i() === props.node.children.length - 1}
                parent={props.node}
                renderPlaceholder={props.renderPlaceholder}
                renderLeaf={props.renderLeaf}
                text={n}
              />
            )}
          </>
        )
      }}
    </For>
  )
}
