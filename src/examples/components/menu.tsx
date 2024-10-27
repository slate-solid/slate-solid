import { splitProps, type JSX } from 'solid-js'
import styles from './menu.module.css'

export type MenuProps = {
  class?: string
  ref?: HTMLDivElement
  children: JSX.Element
} & JSX.HTMLAttributes<HTMLDivElement>

export function Menu(origProps: MenuProps) {
  const [props, restProps] = splitProps(origProps, ['class', 'children', 'ref'])
  return (
    <div
      {...restProps}
      data-test-id="menu"
      ref={props.ref}
      class={[styles.menu, props.class].join(' ')}
    >
      {props.children}
    </div>
  )
}
