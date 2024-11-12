import { isDOMNode } from 'slate-dom'
import type { HTMLEvent } from './types'

export function isDOMEventTargetInput<TEvent extends Event>(
  event: HTMLEvent<TEvent>,
) {
  return (
    isDOMNode(event.target) &&
    (event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement)
  )
}
