import { useLocation, A } from '@solidjs/router'
import { createSignal, For } from 'solid-js'
import { BsCodeSlash } from 'solid-icons/bs'
import styles from './navBar.module.css'
import { classNames } from '../utils'

const routeLinks = {
  '/check-lists': ['Checklists', 'src/examples/checkLists.tsx'],
  '/rich-text': ['Rich Text', 'src/examples/richText.tsx'],
} as const

function ghSrcLink(branch: string, path: string) {
  return `https://github.com/slate-solid/slate-solid/blob/${branch}/${path}`
}

type RoutePath = keyof typeof routeLinks

export function NavBar() {
  const location = useLocation()

  const routeKey = () =>
    location.pathname.replace(import.meta.env.BASE_URL, '') as RoutePath

  const label = () => routeLinks[routeKey()][0]
  const ghHref = () => ghSrcLink('initial-poc', routeLinks[routeKey()][1])

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
                activeClass={styles.active}
                onClick={() => setIsMenuOpen(false)}>
                {routeLinks[path as RoutePath][0]}
              </A>
            </li>
          )}
        </For>
      </ul>
      <span class={styles.content}>
        <label>{label()}</label>
        <a class={styles.ghLink} target="_blank" href={ghHref()}>
          <BsCodeSlash />
          Source
        </a>
      </span>
    </nav>
  )
}
