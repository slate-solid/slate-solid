import {
  createEffect,
  createMemo,
  createSignal,
  splitProps,
  type JSX,
} from 'solid-js'
import { Descendant, Editor, Node, Operation, Scrubber, Selection } from 'slate'
import { EDITOR_TO_ON_CHANGE } from 'slate-dom'
import { FocusedContext } from '../hooks/use-focused'
import { SlateContext, SlateContextValue } from '../hooks/use-slate'
import {
  useSelectorContext,
  SlateSelectorContext,
} from '../hooks/use-slate-selector'
import { EditorContext } from '../hooks/use-slate-static'
import { SolidEditor } from '../plugin/solid-editor'

/**
 * A wrapper around the provider to handle `onChange` events, because the editor
 * is a mutable singleton so it won't ever register as "changed" otherwise.
 */

export const Slate = (props: {
  editor: SolidEditor
  initialValue: Descendant[]
  children: JSX.Element
  onChange?: (value: Descendant[]) => void
  onSelectionChange?: (selection: Selection) => void
  onValueChange?: (value: Descendant[]) => void
}) => {
  const [namedProps, restProps] = splitProps(props, [
    'editor',
    'children',
    'onChange',
    'onSelectionChange',
    'onValueChange',
    'initialValue',
  ])

  const editor = createMemo(() => {
    const { editor } = namedProps
    if (!Node.isNodeList(namedProps.initialValue)) {
      throw new Error(
        `[Slate] initialValue is invalid! Expected a list of elements but got: ${Scrubber.stringify(
          namedProps.initialValue,
        )}`,
      )
    }
    if (!Editor.isEditor(editor)) {
      throw new Error(
        `[Slate] editor is invalid! You passed: ${Scrubber.stringify(editor)}`,
      )
    }
    editor.children = namedProps.initialValue
    Object.assign(editor, restProps)

    return editor
  })

  const [context, setContext] = createSignal<SlateContextValue>({
    v: 0,
    editor: editor(),
  })

  const { selectorContext, onChange: handleSelectorChange } =
    useSelectorContext(editor())

  const onContextChange = (options?: { operation?: Operation }) => {
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

    setContext((prevContext) => ({
      v: prevContext.v + 1,
      editor: editor(),
    }))
    handleSelectorChange(editor())
  }

  createEffect(() => {
    EDITOR_TO_ON_CHANGE.set(props.editor, onContextChange)

    return () => {
      EDITOR_TO_ON_CHANGE.set(props.editor, () => {})
    }
  })

  const [isFocused, setIsFocused] = createSignal(
    SolidEditor.isFocused(editor()),
  )

  createEffect(() => {
    setIsFocused(SolidEditor.isFocused(editor()))
  })

  // useIsomorphicLayoutEffect(() => {
  //   const fn = () => setIsFocused(SolidEditor.isFocused(editor))
  //   if (REACT_MAJOR_VERSION >= 17) {
  //     // In React >= 17 onFocus and onBlur listen to the focusin and focusout events during the bubbling phase.
  //     // Therefore in order for <Editable />'s handlers to run first, which is necessary for SolidEditor.isFocused(editor)
  //     // to return the correct value, we have to listen to the focusin and focusout events without useCapture here.
  //     document.addEventListener('focusin', fn)
  //     document.addEventListener('focusout', fn)
  //     return () => {
  //       document.removeEventListener('focusin', fn)
  //       document.removeEventListener('focusout', fn)
  //     }
  //   } else {
  //     document.addEventListener('focus', fn, true)
  //     document.addEventListener('blur', fn, true)
  //     return () => {
  //       document.removeEventListener('focus', fn, true)
  //       document.removeEventListener('blur', fn, true)
  //     }
  //   }
  // }, [])

  return (
    <SlateSelectorContext.Provider value={selectorContext}>
      <SlateContext.Provider value={context()}>
        <EditorContext.Provider value={context().editor}>
          <FocusedContext.Provider value={isFocused()}>
            {props.children}
          </FocusedContext.Provider>
        </EditorContext.Provider>
      </SlateContext.Provider>
    </SlateSelectorContext.Provider>
  )
}
