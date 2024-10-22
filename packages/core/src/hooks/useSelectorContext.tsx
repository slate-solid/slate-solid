import { createContext, createEffect, useContext } from 'solid-js'
import { Editor } from 'slate'
import { useRef } from './useRef'

function isError(error: any): error is Error {
  return error instanceof Error
}

type EditorChangeHandler = (editor: Editor) => void
/**
 * A React context for sharing the editor selector context in a way to control rerenders
 */

export const SlateSelectorContext = createContext<{
  getSlate: () => Editor
  addEventListener: (callback: EditorChangeHandler) => () => void
}>({} as any)

/**
 * Create selector context with editor updating on every editor change
 */
export function useSelectorContext(editor: Editor) {
  const eventListeners: EditorChangeHandler[] = []

  const slateRef = useRef<{
    editor: Editor
  }>({ editor }).current

  const onChange = (editor: Editor) => {
    slateRef.editor = editor
    eventListeners.forEach((listener: EditorChangeHandler) => listener(editor))
  }

  const selectorContext = {
    getSlate: () => slateRef.editor,
    addEventListener: (callback: EditorChangeHandler) => {
      eventListeners.push(callback)
      return () => {
        eventListeners.splice(eventListeners.indexOf(callback), 1)
      }
    },
  }

  return { selectorContext, onChange }
}
