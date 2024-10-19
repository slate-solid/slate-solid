import type { JSX } from 'solid-js'
import styles from './menu.module.css'

export interface MenuProps {
  class?: string
  ref?: HTMLDivElement
  children: JSX.Element
}

export function Menu(props: MenuProps) {
  return (
    <div
      data-test-id="menu"
      ref={props.ref}
      class={[styles.menu, props.class].join(' ')}>
      {props.children}
    </div>
  )
}
