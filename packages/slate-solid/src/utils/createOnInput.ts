import type { JSX } from 'solid-js'
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager'
import type { MutableRefObject } from '../hooks/useRef'
import { isEventHandled } from './isEventHandled'
import type { DeferredOperation, HTMLInputEvent } from './types'

export function createOnInput({
  androidInputManagerRef,
  deferredOperations,
  onInput,
}: {
  androidInputManagerRef: MutableRefObject<
    AndroidInputManager | null | undefined
  >
  deferredOperations: MutableRefObject<DeferredOperation[]>
  onInput?: JSX.EventHandlerUnion<HTMLDivElement, InputEvent>
}) {
  return (event: HTMLInputEvent) => {
    if (isEventHandled(event, onInput)) {
      return
    }

    if (androidInputManagerRef.current) {
      androidInputManagerRef.current.handleInput()
      return
    }

    // Flush native operations, as native events will have propogated
    // and we can correctly compare DOM text values in components
    // to stop rendering, so that browser functions like autocorrect
    // and spellcheck work as expected.
    for (const op of deferredOperations.current) {
      op()
    }

    deferredOperations.current = []
  }
}
