import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
  type JSX,
} from 'solid-js'
import { Descendant, Editor, Node, Operation, Scrubber, Selection } from 'slate'
import { EDITOR_TO_ON_CHANGE } from 'slate-dom'
import { FocusedContext } from '../hooks/useFocused'
import { SlateContext, SlateContextValue } from '../hooks/useSlate'
import {
  useSelectorContext,
  SlateSelectorContext,
} from '../hooks/useSelectorContext'
import { EditorContext } from '../hooks/useSlateStatic'
import { SolidEditor } from '../plugin/solid-editor'
import { Logger } from '../utils/logger'
import { setNodeWeakMaps } from '../utils/setNodeWeakMaps'

const logger = new Logger('Slate')

/**
 * A wrapper around the provider to handle `onChange` events, because the editor
 * is a mutable singleton so it won't ever register as "changed" otherwise.
 */

export const Slate = (origProps: {
  editor: SolidEditor
  initialValue: Descendant[]
  children: JSX.Element
  onChange?: (value: Descendant[]) => void
  onSelectionChange?: (selection: Selection) => void
  onValueChange?: (value: Descendant[]) => void
}) => {
  const [props, restProps] = splitProps(origProps, [
    'editor',
    'children',
    'onChange',
    'onSelectionChange',
    'onValueChange',
    'initialValue',
  ])

  const initialEditor = createMemo(() => {
    if (!Node.isNodeList(props.initialValue)) {
      throw new Error(
        `[Slate] initialValue is invalid! Expected a list of elements but got: ${Scrubber.stringify(
          props.initialValue,
        )}`,
      )
    }
    if (!Editor.isEditor(props.editor)) {
      throw new Error(
        `[Slate] editor is invalid! You passed: ${Scrubber.stringify(
          props.editor,
        )}`,
      )
    }
    props.editor.children = props.initialValue
    Object.assign(props.editor, restProps)

    setNodeWeakMaps(props.editor)

    return props.editor
  })

  const [editor, setEditor] = createSignal(initialEditor(), {
    // The editor reference doesn't change, so we have to mark it as !== for
    // every signal
    equals: () => false,
  })

  const [context, setContext] = createSignal<SlateContextValue>({
    v: 0,
    editor,
  })

  const { selectorContext, onChange: handleSelectorChange } =
    useSelectorContext(editor())

  const onContextChange = (options?: { operation?: Operation }) => {
    logger.groupCollapsed('onContextChange', options?.operation)
    logger.debug('Selection:', JSON.stringify(editor().selection))
    logger.debug('Children:', JSON.stringify(editor().children, undefined, 2))
    logger.groupEnd()

    setNodeWeakMaps(editor(), options?.operation)

    if (props.onChange) {
      props.onChange(editor().children)
    }

    switch (options?.operation?.type) {
      case 'set_selection':
        props.onSelectionChange?.(editor().selection)
        break
      default:
        props.onValueChange?.(editor().children)
    }

    setContext(prevContext => ({
      v: prevContext.v + 1,
      editor,
    }))
    handleSelectorChange(editor())

    setEditor(editor())
  }

  createEffect(() => {
    EDITOR_TO_ON_CHANGE.set(props.editor, onContextChange)
  })
  onCleanup(() => {
    EDITOR_TO_ON_CHANGE.set(props.editor, () => {})
  })

  const [isFocused, setIsFocused] = createSignal(
    SolidEditor.isFocused(editor()),
  )

  onMount(() => {
    const fn = () => {
      // Call on next tick since this callback runs before the onFocus / onBlur
      // handlers run on the Editable. This ensures the `IS_FOCUSED` WeakMap has
      // been updated which is used by `SolidEditor.isFocused()`.
      setTimeout(() => {
        setIsFocused(SolidEditor.isFocused(editor()))
      }, 0)
    }
    document.addEventListener('focus', fn, true)
    document.addEventListener('blur', fn, true)
    return () => {
      document.removeEventListener('focus', fn, true)
      document.removeEventListener('blur', fn, true)
    }
  })

  return (
    <SlateSelectorContext.Provider value={selectorContext}>
      <SlateContext.Provider value={context}>
        <EditorContext.Provider value={editor}>
          <FocusedContext.Provider value={isFocused}>
            {props.children}
          </FocusedContext.Provider>
        </EditorContext.Provider>
      </SlateContext.Provider>
    </SlateSelectorContext.Provider>
  )
}
