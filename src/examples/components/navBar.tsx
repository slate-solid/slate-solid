import { useLocation, A } from '@solidjs/router'
import { For } from 'solid-js'
import styles from './navBar.module.css'

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
  return (
    <nav class={styles.NavBar}>
      <div class={styles.menuTrigger}>☰</div>
      <ul class={styles.menu}>
        <For each={Object.keys(routeLinks)}>
          {(path) => (
            <li>
              <A class={styles.menuLink} href={path}>
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
