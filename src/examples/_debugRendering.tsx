import { DebugRender } from '@slate-solid/core'
import { createSignal, For, onCleanup, onMount } from 'solid-js'

let count = 0
const initialValue = [{ label: 'a' }, { label: 'b' }]

// TODO: We may want to eventually delete this, but it could be useful while we
// are still ironing out core functionality
export function DebugRenderingExample() {
  const [value, setValue] = createSignal(initialValue, { equals: () => false })

  let interval: number
  onMount(() => {
    interval = setInterval(() => {
      console.log('Tick')
      initialValue[1].label = `b${++count}`
      initialValue.push({ label: `${count}` })
      setValue(value)
    }, 2000)
  })

  onCleanup(() => {
    clearInterval(interval)
  })

  return (
    <>
      <DebugRender label="root" />
      <For each={value()}>
        {child => {
          const label = () => child.label
          return <DebugRender label={label()}>{label()}</DebugRender>
        }}
      </For>
    </>
  )
}

export default DebugRenderingExample
