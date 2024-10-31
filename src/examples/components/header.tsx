import { A } from '@solidjs/router'
import { BsGithub } from 'solid-icons/bs'
import styles from './header.module.css'
import { classNames } from '../utils/cssUtils'

export function Header() {
  return (
    <header class={styles.Header}>
      <A class={styles.a} href="/">
        SlateSolid Examples
      </A>

      <a
        class={classNames(styles.a, styles.icon)}
        target="_blank"
        href="https://github.com/slate-solid/slate-solid"
      >
        <BsGithub />
      </a>
    </header>
  )
}
