import { A } from '@solidjs/router'
import styles from './header.module.css'

export function Header() {
  return (
    <header class={styles.Header}>
      <A class={styles.a} href="/">
        SlateSolid Examples
      </A>
    </header>
  )
}
