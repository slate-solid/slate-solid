import { type JSX } from 'solid-js'
import { classNames } from '../utils'
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
    <span ref={props.ref} class={classNames(styles.button, props.class)}>
      {props.children}
    </span>
  )
}
