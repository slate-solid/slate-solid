import {
  createEffect,
  createMemo,
  For,
  type Accessor,
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
import { isArrayEqual, isJsonStringEqual } from '../utils/isEqual'

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
  const nodePath = createMemo(
    () => SolidEditor.findPath(editor(), props.node),
    undefined,
    {
      // TODO: Is this going to be a performance issue?
      equals: isJsonStringEqual,
    },
  )

  const isLeafBlock = () =>
    Element.isElement(props.node) &&
    !editor().isInline(props.node) &&
    Editor.hasInlines(editor(), props.node)

  return (
    <For each={props.node.children}>
      {(n, i) => {
        const childPath = () => nodePath().concat(i())

        // const key = SolidEditor.findKey(editor(), n)
        const range = () => Editor.range(editor(), childPath())

        const sel = () =>
          props.selection() && Range.intersection(range(), props.selection()!)
        const hasSel = () => !!sel()

        const ds = createMemo(
          () => {
            const ds = decorate([n, childPath()])

            for (const dec of props.decorations) {
              const d = Range.intersection(dec, range())

              if (d) {
                ds.push(d)
              }
            }

            return ds
          },
          undefined,
          // This check is important. It noticably improved performance of the
          // Huge Document example `slate-solid/issues/15` and seems to get rid
          // of some cases in IOS where selectoin had to be re-synced
          // `slate-solid/issues/11`. It's possible there will need to be
          // additional optimization for cases where custom decorations are
          // being used (decorations.length > 0) since reference equality won't
          // match even if decorations don't change.
          { equals: isArrayEqual },
        )

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
