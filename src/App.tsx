import type { Component } from 'solid-js'
import { Editable, Slate, withSolid } from '@slate-solid/slate-solid'
import { createEditor, type Descendant } from 'slate'

import styles from './App.module.css'

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text: ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    align: 'center',
    children: [{ text: 'Try it out for yourself!' }],
  },
]

const App: Component = () => {
  const editor = withSolid(createEditor())
  return (
    <div class={styles.App}>
      <Slate editor={editor} initialValue={initialValue}>
        <Editable class={styles.Editable} />
      </Slate>
    </div>
  )
}

export default App
