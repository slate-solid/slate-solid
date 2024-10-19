import type { Component } from 'solid-js'

import styles from './App.module.css'
import { Router } from '@solidjs/router'
import { Layout } from './examples/components/layout'
import { routes } from './examples/routes'
import { SvgLetterIcon } from './examples/components/svgLetterIcon'

const App: Component = () => {
  return (
    <div class={styles.App}>
      <SvgLetterIcon bg="#477bbe" fg="#fff">
        S
      </SvgLetterIcon>
      <SvgLetterIcon bg="#d8d8d8" fg="#505050">
        S
      </SvgLetterIcon>
      <Router base={import.meta.env.BASE_URL} root={Layout}>
        {routes}
      </Router>
    </div>
  )
}

export default App
