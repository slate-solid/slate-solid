import type { Component } from 'solid-js'

import styles from './App.module.css'
import { Router } from '@solidjs/router'
import { Layout } from './examples/components/layout'
import { routes } from './examples/routes'

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Router base={import.meta.env.BASE_URL} root={Layout}>
        {routes}
      </Router>
    </div>
  )
}

export default App
