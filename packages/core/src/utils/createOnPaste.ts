import type { Accessor, JSX } from 'solid-js'
import type { HTMLEvent } from './types'
import type { Editor } from 'slate'
import { SolidEditor } from '../plugin/solid-editor'
import {
  HAS_BEFORE_INPUT_SUPPORT,
  IS_WEBKIT,
  isPlainTextOnlyPaste,
} from 'slate-dom'
import { isEventHandled } from './isEventHandled'

export function createOnPaste({
  editor,
  readOnly,
  onPaste,
}: {
  editor: Accessor<Editor>
  readOnly: Accessor<boolean>
  onPaste?: JSX.EventHandlerUnion<HTMLDivElement, ClipboardEvent>
}) {
  return (event: HTMLEvent<ClipboardEvent>) => {
    if (
      !readOnly() &&
      SolidEditor.hasEditableTarget(editor(), event.target) &&
      !isEventHandled(event, onPaste)
    ) {
      if (
        !HAS_BEFORE_INPUT_SUPPORT ||
        isPlainTextOnlyPaste(event) ||
        IS_WEBKIT
      ) {
        event.preventDefault()
        if (event.clipboardData == null) {
          return
        }
        SolidEditor.insertData(editor(), event.clipboardData)
      }
    }
  }
}
