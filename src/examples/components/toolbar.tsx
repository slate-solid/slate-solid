import type { JSX } from 'solid-js'
import { classNames } from '../utils'
import { Menu } from './menu'
import styles from './toolbar.module.css'

export interface ToolbarProps {
  ref?: HTMLDivElement
  class?: string
  children: JSX.Element
}

export function Toolbar(props: ToolbarProps) {
  return (
    <Menu ref={props.ref} class={classNames(styles.toolbar, props.class)} />
  )
}
