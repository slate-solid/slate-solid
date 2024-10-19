import type { HTMLInputEvent, HTMLInputEventHandler } from './types'

/**
 * Check if a DOM event is overrided by a handler.
 */
export const isDOMEventHandled = (
  event: HTMLInputEvent,
  handler?: HTMLInputEventHandler,
) => {
  if (!handler) {
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
