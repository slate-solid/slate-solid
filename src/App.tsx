import type { Component } from 'solid-js'

import styles from './App.module.css'
import RichTextExample from './examples/richText'
import { ExampleContent } from './examples/components/exampleContent'
import { Route, Router, useNavigate } from '@solidjs/router'
import CheckListsExample from './examples/checkLists'

function RedirectToDefault() {
  const navigate = useNavigate()
  navigate('/rich-text')
  return null
}

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Router base={import.meta.env.BASE_URL} root={ExampleContent}>
        <Route path="/check-lists" component={CheckListsExample} />
        <Route path="/rich-text" component={RichTextExample} />
        <Route path="*404" component={RedirectToDefault} />
      </Router>
    </div>
  )
}

export default App
