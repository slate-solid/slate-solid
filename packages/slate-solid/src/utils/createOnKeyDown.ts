import type { Accessor, JSX } from 'solid-js'
import { SolidEditor } from '../plugin/solid-editor'
import {
  HAS_BEFORE_INPUT_SUPPORT,
  Hotkeys,
  IS_CHROME,
  IS_COMPOSING,
  IS_WEBKIT,
  type DOMEditor,
} from 'slate-dom'
import { Editor, Element, Node, Range, Transforms } from 'slate'
import { direction as getDirection } from 'direction'
import type { MutableRefObject } from '../hooks/useRef'
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager'
import type { HTMLEvent } from './types'
import { isEventHandled } from './isEventHandled'

export interface CreateOnKeyDownProps {
  editor: Accessor<DOMEditor>
  androidInputManagerRef: MutableRefObject<
    AndroidInputManager | null | undefined
  >
  readOnly: Accessor<boolean>
  onKeyDown?: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent>
  onStopComposing: () => void
}

export function createOnKeyDown({
  editor,
  androidInputManagerRef,
  readOnly,
  onKeyDown,
  onStopComposing,
}: CreateOnKeyDownProps) {
  return (event: HTMLEvent<KeyboardEvent>) => {
    if (!readOnly() && SolidEditor.hasEditableTarget(editor(), event.target)) {
      androidInputManagerRef.current?.handleKeyDown(event)

      // const { nativeEvent } = event
      // TODO: This alias is temporary until things settle to lesson the diffs
      const nativeEvent = event

      // COMPAT: The composition end event isn't fired reliably in all browsers,
      // so we sometimes might end up stuck in a composition state even though we
      // aren't composing any more.
      if (
        SolidEditor.isComposing(editor()) &&
        nativeEvent.isComposing === false
      ) {
        IS_COMPOSING.set(editor(), false)
        onStopComposing()
      }

      // TODO: Implement this
      if (
        isEventHandled(event, onKeyDown) ||
        SolidEditor.isComposing(editor())
      ) {
        return
      }

      const { selection } = editor()
      const element =
        editor().children[selection !== null ? selection.focus.path[0] : 0]
      const isRTL = getDirection(Node.string(element)) === 'rtl'

      // COMPAT: Since we prevent the default behavior on
      // `beforeinput` events, the browser doesn't think there's ever
      // any history stack to undo or redo, so we have to manage these
      // hotkeys ourselves. (2019/11/06)
      if (Hotkeys.isRedo(nativeEvent)) {
        event.preventDefault()
        const maybeHistoryEditor: any = editor()

        if (typeof maybeHistoryEditor.redo === 'function') {
          maybeHistoryEditor.redo()
        }

        return
      }

      if (Hotkeys.isUndo(nativeEvent)) {
        event.preventDefault()
        const maybeHistoryEditor: any = editor()

        if (typeof maybeHistoryEditor.undo === 'function') {
          maybeHistoryEditor.undo()
        }

        return
      }

      // COMPAT: Certain browsers don't handle the selection updates
      // properly. In Chrome, the selection isn't properly extended.
      // And in Firefox, the selection isn't properly collapsed.
      // (2017/10/17)
      if (Hotkeys.isMoveLineBackward(nativeEvent)) {
        event.preventDefault()
        Transforms.move(editor(), { unit: 'line', reverse: true })
        return
      }

      if (Hotkeys.isMoveLineForward(nativeEvent)) {
        event.preventDefault()
        Transforms.move(editor(), { unit: 'line' })
        return
      }

      if (Hotkeys.isExtendLineBackward(nativeEvent)) {
        event.preventDefault()
        Transforms.move(editor(), {
          unit: 'line',
          edge: 'focus',
          reverse: true,
        })
        return
      }

      if (Hotkeys.isExtendLineForward(nativeEvent)) {
        event.preventDefault()
        Transforms.move(editor(), { unit: 'line', edge: 'focus' })
        return
      }

      // COMPAT: If a void node is selected, or a zero-width text node
      // adjacent to an inline is selected, we need to handle these
      // hotkeys manually because browsers won't be able to skip over
      // the void node with the zero-width space not being an empty
      // string.
      if (Hotkeys.isMoveBackward(nativeEvent)) {
        event.preventDefault()

        if (selection && Range.isCollapsed(selection)) {
          Transforms.move(editor(), { reverse: !isRTL })
        } else {
          Transforms.collapse(editor(), {
            edge: isRTL ? 'end' : 'start',
          })
        }

        return
      }

      if (Hotkeys.isMoveForward(nativeEvent)) {
        event.preventDefault()

        if (selection && Range.isCollapsed(selection)) {
          Transforms.move(editor(), { reverse: isRTL })
        } else {
          Transforms.collapse(editor(), {
            edge: isRTL ? 'start' : 'end',
          })
        }

        return
      }

      if (Hotkeys.isMoveWordBackward(nativeEvent)) {
        event.preventDefault()

        if (selection && Range.isExpanded(selection)) {
          Transforms.collapse(editor(), { edge: 'focus' })
        }

        Transforms.move(editor(), {
          unit: 'word',
          reverse: !isRTL,
        })
        return
      }

      if (Hotkeys.isMoveWordForward(nativeEvent)) {
        event.preventDefault()

        if (selection && Range.isExpanded(selection)) {
          Transforms.collapse(editor(), { edge: 'focus' })
        }

        Transforms.move(editor(), {
          unit: 'word',
          reverse: isRTL,
        })
        return
      }

      // COMPAT: Certain browsers don't support the `beforeinput` event, so we
      // fall back to guessing at the input intention for hotkeys.
      // COMPAT: In iOS, some of these hotkeys are handled in the
      if (!HAS_BEFORE_INPUT_SUPPORT) {
        // We don't have a core behavior for these, but they change the
        // DOM if we don't prevent them, so we have to.
        if (
          Hotkeys.isBold(nativeEvent) ||
          Hotkeys.isItalic(nativeEvent) ||
          Hotkeys.isTransposeCharacter(nativeEvent)
        ) {
          event.preventDefault()
          return
        }

        if (Hotkeys.isSoftBreak(nativeEvent)) {
          event.preventDefault()
          Editor.insertSoftBreak(editor())
          return
        }

        if (Hotkeys.isSplitBlock(nativeEvent)) {
          event.preventDefault()
          Editor.insertBreak(editor())
          return
        }

        if (Hotkeys.isDeleteBackward(nativeEvent)) {
          event.preventDefault()

          if (selection && Range.isExpanded(selection)) {
            Editor.deleteFragment(editor(), {
              direction: 'backward',
            })
          } else {
            Editor.deleteBackward(editor())
          }

          return
        }

        if (Hotkeys.isDeleteForward(nativeEvent)) {
          event.preventDefault()

          if (selection && Range.isExpanded(selection)) {
            Editor.deleteFragment(editor(), {
              direction: 'forward',
            })
          } else {
            Editor.deleteForward(editor())
          }

          return
        }

        if (Hotkeys.isDeleteLineBackward(nativeEvent)) {
          event.preventDefault()

          if (selection && Range.isExpanded(selection)) {
            Editor.deleteFragment(editor(), {
              direction: 'backward',
            })
          } else {
            Editor.deleteBackward(editor(), { unit: 'line' })
          }

          return
        }

        if (Hotkeys.isDeleteLineForward(nativeEvent)) {
          event.preventDefault()

          if (selection && Range.isExpanded(selection)) {
            Editor.deleteFragment(editor(), {
              direction: 'forward',
            })
          } else {
            Editor.deleteForward(editor(), { unit: 'line' })
          }

          return
        }

        if (Hotkeys.isDeleteWordBackward(nativeEvent)) {
          event.preventDefault()

          if (selection && Range.isExpanded(selection)) {
            Editor.deleteFragment(editor(), {
              direction: 'backward',
            })
          } else {
            Editor.deleteBackward(editor(), { unit: 'word' })
          }

          return
        }

        if (Hotkeys.isDeleteWordForward(nativeEvent)) {
          event.preventDefault()

          if (selection && Range.isExpanded(selection)) {
            Editor.deleteFragment(editor(), {
              direction: 'forward',
            })
          } else {
            Editor.deleteForward(editor(), { unit: 'word' })
          }

          return
        }
      } else {
        if (IS_CHROME || IS_WEBKIT) {
          // COMPAT: Chrome and Safari support `beforeinput` event but do not fire
          // an event when deleting backwards in a selected void inline node
          if (
            selection &&
            (Hotkeys.isDeleteBackward(nativeEvent) ||
              Hotkeys.isDeleteForward(nativeEvent)) &&
            Range.isCollapsed(selection)
          ) {
            const currentNode = Node.parent(editor(), selection.anchor.path)

            if (
              Element.isElement(currentNode) &&
              Editor.isVoid(editor(), currentNode) &&
              (Editor.isInline(editor(), currentNode) ||
                Editor.isBlock(editor(), currentNode))
            ) {
              event.preventDefault()
              Editor.deleteBackward(editor(), { unit: 'block' })

              return
            }
          }
        }
      }
    }
  }
}
