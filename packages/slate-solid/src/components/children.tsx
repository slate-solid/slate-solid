import {
  createEffect,
  createMemo,
  createRenderEffect,
  For,
  type JSX,
} from 'solid-js'
import { type Ancestor, Range, Editor, Element } from 'slate'
import { SolidEditor } from '../plugin/solid-editor'
import type {
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
} from './propTypes'
import ElementComponent from '../components/element'
import TextComponent from '../components/text'
import { useDecorate } from '../hooks/useDecorate'
import { useSlateStatic } from '../hooks/useSlateStatic'
import { NODE_TO_INDEX, NODE_TO_PARENT } from 'slate-dom'
import { SelectedContext } from '../hooks/useSelected'

export interface ChildrenProps {
  decorations: Range[]
  node: Ancestor
  renderElement?: (props: RenderElementProps) => JSX.Element
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
  renderLeaf?: (props: RenderLeafProps) => JSX.Element
  selection: Range | null
}

export function Children(props: ChildrenProps) {
  const decorate = useDecorate()
  const editor = useSlateStatic()
  const path = SolidEditor.findPath(editor(), props.node)

  const isLeafBlock =
    Element.isElement(props.node) &&
    !editor().isInline(props.node) &&
    Editor.hasInlines(editor(), props.node)

  return (
    <For each={props.node.children}>
      {(n, i) => {
        const p = path.concat(i())
        // const key = SolidEditor.findKey(editor(), n)
        const range = () => Editor.range(editor(), p)

        const sel = () =>
          props.selection && Range.intersection(range(), props.selection)
        const hasSel = () => !!sel()

        const ds = createMemo(() => {
          const ds = decorate([n, p])

          for (const dec of props.decorations) {
            const d = Range.intersection(dec, range())

            if (d) {
              ds.push(d)
            }
          }

          return ds
        })

        createRenderEffect(() => {
          NODE_TO_INDEX.set(n, i())
          NODE_TO_PARENT.set(n, props.node)
        })

        return (
          <>
            {Element.isElement(n) ? (
              <SelectedContext.Provider
                // key={`provider-${key.id}`}
                value={hasSel}>
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
                isLast={isLeafBlock && i() === props.node.children.length - 1}
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
