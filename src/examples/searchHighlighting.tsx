import { Text, Descendant, Element, createEditor, type NodeEntry } from 'slate'
import { withHistory } from 'slate-history'

import { Icon, Toolbar } from './components'
import { createMemo, createSignal } from 'solid-js'
import {
  Editable,
  Slate,
  withSolid,
  type RenderLeafProps,
} from '@slate-solid/core'
import { classNames } from './utils/cssUtils'
import styles from './searchHighlighting.module.css'

const SearchHighlightingExample = () => {
  const [search, setSearch] = createSignal<string | undefined>()
  const editor = createMemo(() => withHistory(withSolid(createEditor())), [])
  const decorate = ([node, path]: NodeEntry) => {
    const ranges = []
    const searchValue = search()
    if (
      searchValue &&
      Element.isElement(node) &&
      Array.isArray(node.children) &&
      node.children.every(Text.isText)
    ) {
      const texts = node.children.map(it => (it as Text).text)
      const str = texts.join('')
      const length = searchValue.length
      let start = str.indexOf(searchValue)
      let index = 0
      let iterated = 0
      while (start !== -1) {
        // Skip already iterated strings
        while (
          index < texts.length &&
          start >= iterated + texts[index].length
        ) {
          iterated = iterated + texts[index].length
          index++
        }
        // Find the index of array and relative position
        let offset = start - iterated
        let remaining = length
        while (index < texts.length && remaining > 0) {
          const currentText = texts[index]
          const currentPath = [...path, index]
          const taken = Math.min(remaining, currentText.length - offset)
          ranges.push({
            anchor: { path: currentPath, offset },
            focus: { path: currentPath, offset: offset + taken },
            highlight: true,
          })
          remaining = remaining - taken
          if (remaining > 0) {
            iterated = iterated + currentText.length
            // Next block will be indexed from 0
            offset = 0
            index++
          }
        }
        // Looking for next search block
        start = str.indexOf(searchValue, start + searchValue.length)
      }
    }

    return ranges
  }

  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Toolbar>
        <div class={styles.toolbarContent}>
          <Icon class={styles.icon} children="search" />
          <input
            type="search"
            placeholder="Search the text..."
            onChange={e => setSearch(e.target.value)}
            class={styles.searchInput}
          />
        </div>
      </Toolbar>
      <Editable decorate={decorate} renderLeaf={props => <Leaf {...props} />} />
    </Slate>
  )
}

const Leaf = (props: RenderLeafProps) => {
  const highlightData = () =>
    'highlight' in props.leaf && props.leaf
      ? { 'data-cy': 'search-highlighted' }
      : undefined

  const isBold = () => 'bold' in props.leaf && props.leaf.bold
  const isHighlighted = () =>
    'highlight' in props.leaf && (props.leaf.highlight as boolean)

  return (
    <span
      {...props.attributes}
      {...highlightData()}
      class={classNames(
        isBold() && styles.bold,
        isHighlighted() && styles.highlighted,
      )}
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
        text: 'This is editable text that you can search. As you search, it looks for matching strings of text, and adds ',
      },
      { text: 'decorations', bold: true },
      { text: ' to them in realtime.' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Try it out for yourself by typing in the search box above!' },
    ],
  },
]

export default SearchHighlightingExample
