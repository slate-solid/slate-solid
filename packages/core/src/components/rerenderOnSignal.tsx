import { children, type Accessor, type JSX } from 'solid-js'

/**
 * Re-render children whenever a signal updates.
 */
export function RerenderOnSignal<T>(props: {
  children: JSX.Element
  signal: Accessor<T>
}) {
  const resolved = children(() => {
    props.signal()
    return props.children
  })

  return <>{resolved()}</>
}
