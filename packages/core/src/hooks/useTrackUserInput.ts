import { createEffect } from 'solid-js'
import { SolidEditor } from '../plugin/solid-editor'
import { useSlateStatic } from './useSlateStatic'
import { useRef } from './useRef'

export function useTrackUserInput() {
  const editor = useSlateStatic()

  const receivedUserInput = useRef<boolean>(false)
  const animationFrameIdRef = useRef<number>(0)

  const onUserInput = () => {
    if (receivedUserInput.current) {
      return
    }

    receivedUserInput.current = true

    const window = SolidEditor.getWindow(editor())
    window.cancelAnimationFrame(animationFrameIdRef.current)

    animationFrameIdRef.current = window.requestAnimationFrame(() => {
      receivedUserInput.current = false
    })
  }

  createEffect(() => () => cancelAnimationFrame(animationFrameIdRef.current))

  return {
    receivedUserInput,
    onUserInput,
  }
}
