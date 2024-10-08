import type { Component } from 'solid-js'
import { Editable, Slate, withSolid } from '@slate-solid/slate-solid'
import { createEditor } from 'slate'

import styles from './App.module.css'

const App: Component = () => {
  const editor = withSolid(createEditor())
  return (
    <div class={styles.App}>
      <Slate editor={editor} initialValue={[]}>
        <Editable class={styles.Editable} />
      </Slate>
    </div>
  )
}

export default App
