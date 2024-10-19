import { type JSX } from 'solid-js'
import { classNames } from '../utils/cssUtils'
import styles from './button.module.css'

export type ButtonProps = {
  class?: string
  ref?: HTMLSpanElement
  active?: boolean
  reversed?: boolean
  children: JSX.Element
} & JSX.HTMLAttributes<HTMLSpanElement>

export function Button(props: ButtonProps) {
  return (
    <span
      ref={props.ref}
      class={classNames(
        styles.button,
        props.class,
        props.active && styles.active,
        props.reversed && styles.reversed,
      )}
      onMouseDown={props.onMouseDown}>
      {props.children}
    </span>
  )
}
