import type { Component } from 'solid-js'
import { Editable } from '@slate-solid/slate-solid'

import styles from './App.module.css'

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Editable class={styles.Editable} />
    </div>
  )
}

export default App
