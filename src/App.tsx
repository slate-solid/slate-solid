import type { Component } from 'solid-js'

import styles from './App.module.css'
import { Router } from '@solidjs/router'
import { Layout } from './examples/components/layout'
import { routes } from './examples/routes'
import { Test } from '@slate-solid/core'

const App: Component = () => {
  // return <Test />
  return (
    <div class={styles.App}>
      <Router base={import.meta.env.BASE_URL} root={Layout}>
        {routes}
      </Router>
    </div>
  )
}

export default App
