import type { JSX } from 'solid-js/jsx-runtime'
import { Element, Range, Text as SlateText } from 'slate'
import { useSlateStatic } from '../hooks/useSlateStatic'
import { SolidEditor } from '../plugin/solid-editor'
import { isTextDecorationsEqual } from 'slate-dom'
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from 'slate-dom'
import { RenderLeafProps, RenderPlaceholderProps } from './propTypes'
import Leaf from './leaf'
import { useRef } from '../hooks/useRef'
import { createEffect, For } from 'solid-js'

export interface TextProps {
  decorations: Range[]
  isLast: boolean
  parent: Element
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
  renderLeaf?: (props: RenderLeafProps) => JSX.Element
  text: SlateText
}

/**
 * Text.
 */
const Text = (props: TextProps) => {
  const editor = useSlateStatic()
  const ref = useRef<HTMLSpanElement | null>(null)
  const leaves = SlateText.decorations(props.text, props.decorations)
  const key = SolidEditor.findKey(editor(), props.text)

  // Update element-related weak maps with the DOM element ref.
  const callbackRef = (span: HTMLSpanElement | null) => {
    const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor())
    if (span) {
      KEY_TO_ELEMENT?.set(key, span)
      NODE_TO_ELEMENT.set(props.text, span)
      ELEMENT_TO_NODE.set(span, props.text)
    } else {
      KEY_TO_ELEMENT?.delete(key)
      NODE_TO_ELEMENT.delete(props.text)
      if (ref.current) {
        ELEMENT_TO_NODE.delete(ref.current)
      }
    }
    ref.current = span
  }

  return (
    <span data-slate-node="text" ref={callbackRef}>
      <For each={leaves}>
        {(leaf, i) => (
          <Leaf
            isLast={props.isLast && i() === leaves.length - 1}
            // key={`${key.id}-${i}`}
            renderPlaceholder={props.renderPlaceholder}
            leaf={leaf}
            text={props.text}
            parent={props.parent}
            renderLeaf={props.renderLeaf}
          />
        )}
      </For>
    </span>
  )
}

// TODO: SolidJS doesn't need `memo` in the same way React does, but there may
// be implications here that need to be applied in a SolidJS way.
// const MemoizedText = React.memo(Text, (prev, next) => {
//   return (
//     next.parent === prev.parent &&
//     next.isLast === prev.isLast &&
//     next.renderLeaf === prev.renderLeaf &&
//     next.renderPlaceholder === prev.renderPlaceholder &&
//     next.text === prev.text &&
//     isTextDecorationsEqual(next.decorations, prev.decorations)
//   )
// })

// export default MemoizedText

export default Text
