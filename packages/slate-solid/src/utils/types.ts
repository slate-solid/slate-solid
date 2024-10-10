import type { JSX } from 'solid-js'

export type DeferredOperation = () => void

// Extracted from SolidJS `InputEventHandler` type
export type HTMLInputEvent<T = HTMLDivElement> = InputEvent & {
  currentTarget: T
  target: globalThis.Element
}

export type HTMLInputEventHandler<T = HTMLDivElement> = JSX.InputEventHandler<
  T,
  InputEvent
>
