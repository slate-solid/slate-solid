import { createEffect, createMemo } from 'solid-js'
import {
  Slate,
  Editable,
  withSolid,
  useSlate,
  useFocused,
  useRef,
} from '@slate-solid/core'
import { Editor, createEditor, Descendant, Range } from 'slate'
import { withHistory } from 'slate-history'

import { Button, Icon, Menu, type IconType } from './components'
import { Portal } from 'solid-js/web'
import styles from './hoveringToolbar.module.css'
import type { MarkFormat } from './custom-types'
import { isMarkActive, Leaf, toggleMark } from './richText'

const HoveringMenuExample = () => {
  const editor = createMemo(() => withHistory(withSolid(createEditor())))

  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <HoveringToolbar />
      <Editable
        renderLeaf={props => <Leaf {...props} />}
        placeholder="Enter some text..."
        onDOMBeforeInput={(event: InputEvent) => {
          switch (event.inputType) {
            case 'formatBold':
              event.preventDefault()
              return toggleMark(editor(), 'bold')
            case 'formatItalic':
              event.preventDefault()
              return toggleMark(editor(), 'italic')
            case 'formatUnderline':
              event.preventDefault()
              return toggleMark(editor(), 'underline')
          }
        }}
      />
    </Slate>
  )
}

const HoveringToolbar = () => {
  const ref = useRef<HTMLDivElement>()
  const editor = useSlate()
  const inFocus = useFocused()

  createEffect(() => {
    const el = ref.current
    const { selection } = editor()

    if (!el) {
      return
    }

    if (
      !selection ||
      !inFocus() ||
      Range.isCollapsed(selection) ||
      Editor.string(editor(), selection) === ''
    ) {
      el.removeAttribute('style')
      return
    }

    const domSelection = window.getSelection()
    const domRange = domSelection!.getRangeAt(0)
    const rect = domRange.getBoundingClientRect()
    el.style.opacity = '1'
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
    }px`
  })

  return (
    <Portal>
      <Menu
        ref={ref.current}
        class={styles.menu}
        onMouseDown={e => {
          // prevent toolbar from taking focus away from editor
          e.preventDefault()
        }}
      >
        <FormatButton format="bold" icon="format_bold" />
        <FormatButton format="italic" icon="format_italic" />
        <FormatButton format="underline" icon="format_underlined" />
      </Menu>
    </Portal>
  )
}

const FormatButton = (props: { format: MarkFormat; icon: IconType }) => {
  const editor = useSlate()
  return (
    <Button
      reversed
      active={isMarkActive(editor(), props.format)}
      onClick={() => toggleMark(editor(), props.format)}
    >
      <Icon>{props.icon}</Icon>
    </Button>
  )
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'This example shows how you can make a hovering menu appear above your content, which you can use to make text ',
      },
      { text: 'bold', bold: true },
      { text: ', ' },
      { text: 'italic', italic: true },
      { text: ', or anything else you might want to do!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Try it out yourself! Just ' },
      { text: 'select any piece of text and the menu will appear', bold: true },
      { text: '.' },
    ],
  },
]

export default HoveringMenuExample
