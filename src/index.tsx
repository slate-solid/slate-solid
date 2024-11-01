/* @refresh reload */
import { render } from 'solid-js/web'

if (import.meta.env.DEV) {
  const query = new URLSearchParams(location.search)

  if (query.has('devtools')) {
    const { attachDevtoolsOverlay } = await import('@solid-devtools/overlay')

    const defaultOpen = query.get('devtools') === 'open'

    setTimeout(
      () => {
        attachDevtoolsOverlay({
          defaultOpen,
        })
      },
      // Attach devtools with a little delay to give example time to load if we
      // are setting `devtools=open`
      defaultOpen ? 1000 : 0,
    )
  }
}

import './index.css'
import App from './App'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  )
}

render(() => <App />, root!)
