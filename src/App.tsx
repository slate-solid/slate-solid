import type { Component } from 'solid-js'

import styles from './App.module.css'
import RichTextExample from './examples/richText'
import { ExampleContent } from './examples/components/exampleContent'
import { Route, Router } from '@solidjs/router'

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Router base={import.meta.env.BASE_URL} root={ExampleContent}>
        <Route path="/" component={RichTextExample} />
        <Route path="*404" component={() => <div>Not found.</div>} />
      </Router>
    </div>
  )
}

export default App
