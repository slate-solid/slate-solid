import { onCleanup, onMount, type JSX } from 'solid-js'

export interface DebugRenderProps {
  label: string
  children?: JSX.Element
}

/**
 * Component for debugging render, mount, unmount, etc.
 */
export function DebugRender(props: DebugRenderProps) {
  onMount(() => {
    console.log(`[DebugRender] ${props.label} onMount`)
  })

  onCleanup(() => {
    console.log(`[DebugRender] ${props.label} onCleanup`)
  })

  return <>{props.children}</>
}
