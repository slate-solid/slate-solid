import { useLocation, A } from '@solidjs/router'
import { createSignal, For } from 'solid-js'
import { BsCode } from 'solid-icons/bs'
import styles from './navBar.module.css'
import { classNames } from '../utils/cssUtils'
import { routeMap, type RoutePath } from '../routes'

function ghSrcLink(branch: string, path?: string) {
  return `https://github.com/slate-solid/slate-solid/blob/${branch}/${path}`
}

export function NavBar() {
  const location = useLocation()

  const routeKey = () =>
    location.pathname
      .replace(import.meta.env.BASE_URL, '')
      .replace(/\/$/, '') as RoutePath

  const label = () => routeMap[routeKey()]?.label
  const ghHref = () => ghSrcLink('main', routeMap[routeKey()]?.src)

  const [isMenuOpen, setIsMenuOpen] = createSignal(false)

  // Ignore any src files prefixed with _
  const ignoreUnderscorePrefixed = /\/_[^/]+$/

  // Sort by label
  const routePaths = Object.keys(routeMap)
    .filter(
      path => !ignoreUnderscorePrefixed.test(routeMap[path as RoutePath].src),
    )
    .sort((a, b) =>
      routeMap[a as RoutePath].label.localeCompare(
        routeMap[b as RoutePath].label,
      ),
    )

  return (
    <nav class={styles.NavBar}>
      <div
        class={styles.menuTrigger}
        onClick={() => setIsMenuOpen(isOpen => !isOpen)}
      >
        ☰
      </div>
      <ul class={classNames(styles.menu, isMenuOpen() && styles.isOpen)}>
        <For each={routePaths}>
          {path => (
            <li>
              <A
                class={styles.menuLink}
                href={path}
                activeClass={styles.active}
                onClick={() => setIsMenuOpen(false)}
              >
                {routeMap[path as RoutePath]?.label}
              </A>
            </li>
          )}
        </For>
      </ul>
      <span class={styles.content}>
        <label>{label()}</label>
        <a class={styles.ghLink} target="_blank" href={ghHref()}>
          <BsCode />
          Source
        </a>
      </span>
    </nav>
  )
}
