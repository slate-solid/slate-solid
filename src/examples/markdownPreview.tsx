import Prism from 'prismjs'
import 'prismjs/components/prism-markdown'
import {
  Slate,
  Editable,
  withSolid,
  type RenderLeafProps,
} from '@slate-solid/core'
import {
  Text,
  createEditor,
  Descendant,
  type NodeEntry,
  type Range,
} from 'slate'
import { withHistory } from 'slate-history'
import { createMemo } from 'solid-js'
import styles from './markdownPreview.module.css'

const MarkdownPreviewExample = () => {
  const renderLeaf = (props: RenderLeafProps) => <Leaf {...props} />
  const editor = createMemo(() => withHistory(withSolid(createEditor())))
  const decorate = ([node, path]: NodeEntry) => {
    const ranges: Range[] = []

    if (!Text.isText(node)) {
      return ranges
    }

    const getLength = (token: string | Prism.Token) => {
      if (typeof token === 'string') {
        return token.length
      } else if (typeof token.content === 'string') {
        return token.content.length
      } else {
        return (token.content as (string | Prism.Token)[]).reduce(
          (l, t): number => l + getLength(t),
          0,
        )
      }
    }

    const tokens = Prism.tokenize(node.text, Prism.languages.markdown)
    let start = 0

    for (const token of tokens) {
      const length = getLength(token)
      const end = start + length

      if (typeof token !== 'string') {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        })
      }

      start = end
    }

    return ranges
  }

  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Editable
        decorate={decorate}
        renderLeaf={renderLeaf}
        placeholder="Write some markdown..."
      />
    </Slate>
  )
}

const Leaf = (props: RenderLeafProps) => {
  return (
    <span
      {...props.attributes}
      class={styles.Leaf}
      classList={{
        [styles.bold]: 'bold' in props.leaf && props.leaf.bold,
        [styles.italic]: 'italic' in props.leaf && props.leaf.italic,
        [styles.underlined]:
          'underlined' in props.leaf && props.leaf.underlined,
        [styles.title]: 'title' in props.leaf && !!props.leaf.title,
        [styles.list]: 'list' in props.leaf && !!props.leaf.list,
        [styles.hr]: 'hr' in props.leaf && !!props.leaf.hr,
        [styles.blockQuote]:
          'blockquote' in props.leaf && !!props.leaf.blockquote,
        [styles.code]: 'code' in props.leaf && props.leaf.code,
      }}
    >
      {props.children}
    </span>
  )
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Slate is flexible enough to add **decorations** that can format text based on its content. For example, this editor has **Markdown** preview decorations on it, to make it _dead_ simple to make an editor with built-in Markdown previewing.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: '## Try it out!' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Try it out for yourself!' }],
  },
]

export default MarkdownPreviewExample
