export type DeferredOperation = () => void

// Extracted from SolidJS `InputEventHandler` type
export type HTMLEvent<
  TEvent extends Event,
  TCurrentTarget extends HTMLElement = HTMLDivElement,
> = TEvent & {
  currentTarget: TCurrentTarget
  target: globalThis.Element
}

/** Events */
// export type HTMLInputEvent<TElement extends HTMLElement = HTMLDivElement> =
//   HTMLEvent<InputEvent, TElement>

// export type HTMLKeyboardEvent<TElement extends HTMLElement = HTMLDivElement> =
//   HTMLEvent<KeyboardEvent, TElement>

// export type HTMLMouseEvent<TElement extends HTMLElement = HTMLDivElement> =
//   HTMLEvent<MouseEvent, TElement>

/** Handlers */
// export type HTMLInputEventHandler<T = HTMLDivElement> = JSX.InputEventHandler<
//   T,
//   InputEvent
// >
// export type HTMLMouseEventHandler<T = HTMLDivElement> = JSX.EventHandler<
//   T,
//   MouseEvent
// >
