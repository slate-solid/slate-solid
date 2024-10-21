import { type JSX } from 'solid-js'
import type { HTMLEvent } from './types'

/**
 * Check if a DOM event is overrided by a handler.
 */
export const isEventHandled = <
  TEvent extends Event,
  TElement extends HTMLElement = HTMLDivElement,
>(
  event: HTMLEvent<TEvent, TElement>,
  handler?: JSX.EventHandlerUnion<TElement, HTMLEvent<TEvent, TElement>>,
) => {
  // TODO: Determine if we need to handle SolidJS bound events
  if (!handler || typeof handler !== 'function') {
    return false
  }

  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event)

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled
  }

  return event.defaultPrevented
}
