import { createMemo, JSX, mergeProps } from 'solid-js'
import { direction as getDirection } from 'direction'
import { Editor, Element as SlateElement, Node, Range } from 'slate'
import { SolidEditor } from '../plugin/solid-editor'
import { useReadOnly } from '../hooks/useReadOnly'
import { useSlateStatic } from '../hooks/useSlateStatic'
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
} from 'slate-dom'
import {
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
} from './propTypes'

import Text from './text'
import { Div, Span } from './html'
import { DefaultElement } from './defaultElement'
import { Children } from './children'

export interface ElementProps {
  decorations: Range[]
  element: SlateElement
  renderElement?: (props: RenderElementProps) => JSX.Element
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
  renderLeaf?: (props: RenderLeafProps) => JSX.Element
  selection: Range | null
}

/**
 * Element.
 */
const Element = (origProps: ElementProps) => {
  const props = mergeProps(
    { renderElement: (p: RenderElementProps) => <DefaultElement {...p} /> },
    origProps,
  )
  const editor = useSlateStatic()
  const readOnly = useReadOnly()
  const isInline = () => editor().isInline(props.element)
  const isVoid = () => Editor.isVoid(editor(), props.element)
  const key = () => SolidEditor.findKey(editor(), props.element)
  const ref = (ref: HTMLElement | null) => {
    // Update element-related weak maps with the DOM element ref.
    const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor())
    if (ref) {
      KEY_TO_ELEMENT?.set(key(), ref)
      NODE_TO_ELEMENT.set(props.element, ref)
      ELEMENT_TO_NODE.set(ref, props.element)
    } else {
      KEY_TO_ELEMENT?.delete(key())
      NODE_TO_ELEMENT.delete(props.element)
    }
  }

  const attributes = createMemo(() => {
    // Attributes that the developer must mix into the element in their
    // custom node renderer component.
    const attributes: {
      'data-slate-node': 'element'
      'data-slate-void'?: true
      'data-slate-inline'?: true
      contentEditable?: false
      dir?: 'rtl'
      ref: any
    } = {
      'data-slate-node': 'element',
      ref,
    }

    if (isInline()) {
      attributes['data-slate-inline'] = true
    }

    // If it's a block node with inline children, add the proper `dir` attribute
    // for text direction.
    if (!isInline() && Editor.hasInlines(editor(), props.element)) {
      const text = Node.string(props.element)
      const dir = getDirection(text)

      if (dir === 'rtl') {
        attributes.dir = dir
      }
    }

    // If it's a void node, wrap the children in extra void-specific elements.
    if (isVoid()) {
      attributes['data-slate-void'] = true

      if (!readOnly() && isInline()) {
        attributes.contentEditable = false
      }
    }

    return attributes
  })

  const children = createMemo(() => {
    let children: JSX.Element = (
      <Children
        decorations={props.decorations}
        node={props.element}
        renderElement={props.renderElement}
        renderPlaceholder={props.renderPlaceholder}
        renderLeaf={props.renderLeaf}
        selection={props.selection}
      />
    )

    // If it's a void node, wrap the children in extra void-specific elements.
    if (isVoid()) {
      const Tag = isInline() ? Span : Div
      const [[text]] = Node.texts(props.element)

      children = (
        <Tag
          data-slate-spacer
          style={{
            height: '0',
            color: 'transparent',
            outline: 'none',
            position: 'absolute',
          }}>
          <Text
            renderPlaceholder={props.renderPlaceholder}
            decorations={[]}
            isLast={false}
            parent={props.element}
            text={text}
          />
        </Tag>
      )

      NODE_TO_INDEX.set(text, 0)
      NODE_TO_PARENT.set(text, props.element)
    }

    return children
  })

  return props.renderElement({
    attributes: attributes(),
    children,
    element: props.element,
  })
}

// TODO: Figure out if there needs to be something similar in SolidJS
// const MemoizedElement = React.memo(Element, (prev, next) => {
//   return (
//     prev.element === next.element &&
//     prev.renderElement === next.renderElement &&
//     prev.renderLeaf === next.renderLeaf &&
//     prev.renderPlaceholder === next.renderPlaceholder &&
//     isElementDecorationsEqual(prev.decorations, next.decorations) &&
//     (prev.selection === next.selection ||
//       (!!prev.selection &&
//         !!next.selection &&
//         Range.equals(prev.selection, next.selection)))
//   )
// })

// export default MemoizedElement

export default Element
