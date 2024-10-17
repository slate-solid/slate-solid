import type { JSX } from 'solid-js'
import styles from './exampleContent.module.css'

export interface ExampleContentProps {
  children?: JSX.Element
}

export function ExampleContent(props: ExampleContentProps) {
  return <div class={styles.exampleContent}>{props.children}</div>
}
