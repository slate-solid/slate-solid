import { createContext } from 'solid-js'
import { Editor } from 'slate'
import { useRef } from './useRef'

// TODO: This was used by `useSlateSelector` in slate-react. TBD whether we need
// it.
// function isError(error: any): error is Error {
//   return error instanceof Error
// }

type EditorChangeHandler = (editor: Editor) => void
/**
 * A React context for sharing the editor selector context in a way to control rerenders
 */

export const SlateSelectorContext = createContext<{
  getSlate: () => Editor
  addEventListener: (callback: EditorChangeHandler) => () => void
}>()

/**
 * Create selector context with editor updating on every editor change
 */
export function useSelectorContext(editor: Editor) {
  const eventListeners: EditorChangeHandler[] = []

  // TODO: This can probably be simplified to not need `useRef`
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
