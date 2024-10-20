import type { JSX } from 'solid-js'

export type DeferredOperation = () => void

// Extracted from SolidJS `InputEventHandler` type
export type HTMLEvent<
  TElement extends HTMLElement,
  TEvent extends Event,
> = TEvent & {
  currentTarget: TElement
  target: globalThis.Element
}

/** Events */
export type HTMLInputEvent<TElement extends HTMLElement = HTMLDivElement> =
  HTMLEvent<TElement, InputEvent>

export type HTMLKeyboardEvent<TElement extends HTMLElement = HTMLDivElement> =
  HTMLEvent<TElement, KeyboardEvent>

export type HTMLMouseEvent<TElement extends HTMLElement = HTMLDivElement> =
  HTMLEvent<TElement, MouseEvent>

/** Handlers */
export type HTMLInputEventHandler<T = HTMLDivElement> = JSX.InputEventHandler<
  T,
  InputEvent
>
export type HTMLMouseEventHandler<T = HTMLDivElement> = JSX.EventHandler<
  T,
  MouseEvent
>
