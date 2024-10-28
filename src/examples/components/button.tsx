import { splitProps, type JSX } from 'solid-js'
import { classNames } from '../utils/cssUtils'
import styles from './button.module.css'

export type ButtonProps = {
  class?: string
  ref?: HTMLSpanElement
  active?: boolean
  reversed?: boolean
  children: JSX.Element
} & JSX.HTMLAttributes<HTMLSpanElement>

export function Button(origProps: ButtonProps) {
  const [props, restProps] = splitProps(origProps, [
    'ref',
    'children',
    'class',
    'active',
    'reversed',
    'onMouseDown',
  ])
  return (
    <span
      {...restProps}
      ref={props.ref}
      class={classNames(
        styles.button,
        props.class,
        props.active && styles.active,
        props.reversed && styles.reversed,
      )}
      onMouseDown={props?.onMouseDown}
    >
      {props.children}
    </span>
  )
}
