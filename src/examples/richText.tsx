import { children, createMemo, Match, Switch, type JSX } from 'solid-js'
import isHotkey from 'is-hotkey'
import {
  Editable,
  withSolid,
  useSlate,
  Slate,
  type RenderLeafProps,
  type RenderElementProps,
  type SolidEditor,
} from '@slate-solid/slate-solid'
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Element as SlateElement,
} from 'slate'
import { withHistory } from 'slate-history'

import { Button, Icon, Toolbar } from './components'
import type {
  BlockFormat,
  BlockType,
  CustomElement,
  Format,
  ListType,
  MarkFormat,
  TextAlign,
} from './custom-types'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}

const LIST_TYPES = ['numbered-list', 'bulleted-list'] as const
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'] as const

const RichTextExample = () => {
  const renderElement = (props: RenderElementProps) => <Element {...props} />
  const renderLeaf = (props: RenderLeafProps) => <Leaf {...props} />
  const editor = createMemo(() => withHistory(withSolid(createEditor())))

  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Toolbar>
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        <MarkButton format="code" icon="code" />
        <BlockButton format="heading-one" icon="looks_one" />
        <BlockButton format="heading-two" icon="looks_two" />
        <BlockButton format="block-quote" icon="format_quote" />
        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
        <BlockButton format="left" icon="format_align_left" />
        <BlockButton format="center" icon="format_align_center" />
        <BlockButton format="right" icon="format_align_right" />
        <BlockButton format="justify" icon="format_align_justify" />
      </Toolbar>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellcheck
        autofocus
        // TODO: I don't think `onKeyDown` is implemented yet
        onKeyDown={(event) => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event as any)) {
              event.preventDefault()
              const mark = HOTKEYS[hotkey as keyof typeof HOTKEYS] as MarkFormat
              toggleMark(editor(), mark)
            }
          }
        }}
      />
    </Slate>
  )
}

const toggleBlock = (editor: Editor, format: BlockFormat) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format as TextAlign) ? 'align' : 'type',
  )
  const isList = LIST_TYPES.includes(format as ListType)

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type as ListType) &&
      !TEXT_ALIGN_TYPES.includes(format as TextAlign),
    split: true,
  })
  let newProperties: Partial<SlateElement>
  if (TEXT_ALIGN_TYPES.includes(format as TextAlign)) {
    newProperties = {
      align: isActive ? undefined : (format as TextAlign),
    }
  } else {
    newProperties = {
      type: isActive
        ? 'paragraph'
        : isList
        ? 'list-item'
        : (format as Exclude<BlockFormat, TextAlign>),
    }
  }
  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] } as SlateElement
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor: SolidEditor, format: MarkFormat) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor: Editor, format: Format, blockType = 'type') => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType as 'type'] === format,
    }),
  )

  return !!match
}

const isMarkActive = (editor: Editor, format: MarkFormat) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format as keyof typeof marks] === true : false
}

const Element = (props: RenderElementProps) => {
  const style = createMemo<JSX.CSSProperties>(() => ({
    'text-align': props.element.align,
  }))

  return (
    <Switch
      fallback={
        <p style={style()} {...props.attributes}>
          {props.children}
        </p>
      }>
      <Match when={props.element.type === 'block-quote'}>
        <blockquote style={style()} {...props.attributes}>
          {props.children}
        </blockquote>
      </Match>
      <Match when={props.element.type === 'bulleted-list'}>
        <ul style={style()} {...props.attributes}>
          {props.children}
        </ul>
      </Match>
      <Match when={props.element.type === 'heading-one'}>
        <h1 style={style()} {...props.attributes}>
          {props.children}
        </h1>
      </Match>
      <Match when={props.element.type === 'heading-two'}>
        <h2 style={style()} {...props.attributes}>
          {props.children}
        </h2>
      </Match>
      <Match when={props.element.type === 'list-item'}>
        <li style={style()} {...props.attributes}>
          {props.children}
        </li>
      </Match>
      <Match when={props.element.type === 'numbered-list'}>
        <ol style={style()} {...props.attributes}>
          {props.children}
        </ol>
      </Match>
    </Switch>
  )
}

const Leaf = (props: RenderLeafProps) => {
  const resolved = children(() => {
    let children = props.children

    if ('bold' in props.leaf && props.leaf.bold) {
      children = <strong>{props.children}</strong>
    }

    if ('code' in props.leaf && props.leaf.code) {
      children = <code>{props.children}</code>
    }

    if ('italic' in props.leaf && props.leaf.italic) {
      children = <em>{props.children}</em>
    }

    if ('underline' in props.leaf && props.leaf.underline) {
      children = <u>{props.children}</u>
    }

    return children
  })

  return <span {...props.attributes}>{resolved()}</span>
}

const BlockButton = ({
  format,
  icon,
}: {
  format: BlockFormat
  icon: string
}) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(
        editor(),
        format,
        TEXT_ALIGN_TYPES.includes(format as TextAlign) ? 'align' : 'type',
      )}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleBlock(editor(), format)
      }}>
      <Icon>{icon}</Icon>
    </Button>
  )
}

const MarkButton = ({ format, icon }: { format: MarkFormat; icon: string }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor(), format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleMark(editor(), format)
      }}>
      <Icon>{icon}</Icon>
    </Button>
  )
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text: ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    align: 'center',
    children: [{ text: 'Try it out for yourself!' }],
  },
]

export default RichTextExample
