import { Editor, Text, Path, Element, Node } from 'slate'

import { SolidEditor } from '../plugin/solid-editor'
import { useSlateStatic } from '../hooks/useSlateStatic'
// import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'
import { MARK_PLACEHOLDER_SYMBOL } from 'slate-dom'
import { Match, Switch } from 'solid-js'
import { TextString } from './textString'
import { ZeroWidthString } from './zeroWidthString'

export interface StringProps {
  isLast: boolean
  leaf: Text
  parent: Element
  text: Text
}

/**
 * Leaf content strings.
 */
const String = (props: StringProps) => {
  const editor = useSlateStatic()
  const path = () => SolidEditor.findPath(editor(), props.text)
  const parentPath = () => Path.parent(path())
  const isMarkPlaceholder = () => Boolean(props.leaf[MARK_PLACEHOLDER_SYMBOL])

  return (
    <Switch fallback={<TextString text={props.leaf.text} />}>
      {/*
       * COMPAT: Render text inside void nodes with a zero-width space. // So
       * the node can contain selection but the text is not visible.
       */}
      <Match when={editor().isVoid(props.parent)}>
        <ZeroWidthString length={Node.string(props.parent).length} />
      </Match>

      {/*
       * COMPAT: If this is the last text node in an empty block, render a zero-
       * width space that will convert into a line break when copying and pasting
       * to support expected plain text.
       */}
      <Match
        when={
          props.leaf.text === '' &&
          props.parent.children[props.parent.children.length - 1] ===
            props.text &&
          !editor().isInline(props.parent) &&
          Editor.string(editor(), parentPath()) === ''
        }>
        <ZeroWidthString isLineBreak isMarkPlaceholder={isMarkPlaceholder()} />
      </Match>

      {/*
       * COMPAT: If the text is empty, it's because it's on the edge of an inline
       * node, so we render a zero-width space so that the selection can be
       * inserted next to it still.
       */}
      <Match when={props.leaf.text === ''}>
        <ZeroWidthString isMarkPlaceholder={isMarkPlaceholder()} />
      </Match>

      {/*
       * COMPAT: Browsers will collapse trailing new lines at the end of blocks,
       * so we need to add an extra trailing new lines to prevent that.
       */}
      <Match when={props.isLast && props.leaf.text.slice(-1) === '\n'}>
        <TextString isTrailing text={props.leaf.text} />
      </Match>
    </Switch>
  )
}

export default String
