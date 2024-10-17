import { useLocation, A } from '@solidjs/router'
import { createSignal, For } from 'solid-js'
import styles from './navBar.module.css'
import { classNames } from '../utils'

const routeLinks = {
  '/check-lists': 'Checklists',
  '/rich-text': 'Rich Text',
} as const

type RoutePath = keyof typeof routeLinks

export function NavBar() {
  const location = useLocation()
  const label = () => {
    const key = location.pathname.replace(
      import.meta.env.BASE_URL,
      '',
    ) as RoutePath
    return routeLinks[key]
  }

  const [isMenuOpen, setIsMenuOpen] = createSignal(false)

  return (
    <nav class={styles.NavBar}>
      <div
        class={styles.menuTrigger}
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}>
        ☰
      </div>
      <ul class={classNames(styles.menu, isMenuOpen() && styles.isOpen)}>
        <For each={Object.keys(routeLinks)}>
          {(path) => (
            <li>
              <A
                class={styles.menuLink}
                href={path}
                onClick={() => setIsMenuOpen(false)}>
                {routeLinks[path as RoutePath]}
              </A>
            </li>
          )}
        </For>
      </ul>
      <label>{label()}</label>
    </nav>
  )
}
