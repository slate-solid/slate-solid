import isUrl from 'is-url'
import { isKeyHotkey } from 'is-hotkey'
import {
  Editable,
  withSolid,
  useSlate,
  useSelected,
  type HTMLEvent,
  Slate,
  type RenderElementProps,
  type RenderLeafProps,
} from '@slate-solid/core'
import {
  Transforms,
  Editor,
  Range,
  createEditor,
  Element as SlateElement,
  Descendant,
} from 'slate'
import { withHistory } from 'slate-history'
import { LinkElement, ButtonElement } from './custom-types.d'

import { Button, Icon, Toolbar } from './components'
import { createMemo } from 'solid-js'
import styles from './inlines.module.css'
import { classNames } from './utils/cssUtils'

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'In addition to block nodes, you can create inline nodes. Here is a ',
      },
      {
        type: 'link',
        url: 'https://en.wikipedia.org/wiki/Hypertext',
        children: [{ text: 'hyperlink' }],
      },
      {
        text: ', and here is a more unusual inline: an ',
      },
      {
        type: 'button',
        children: [{ text: 'editable button' }],
      },
      {
        text: '! Here is a read-only inline: ',
      },
      {
        type: 'badge',
        children: [{ text: 'Approved' }],
      },
      {
        text: '.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'There are two ways to add links. You can either add a link via the toolbar icon above, or if you want in on a little secret, copy a URL to your keyboard and paste it while a range of text is selected. ',
      },
      // The following is an example of an inline at the end of a block.
      // This is an edge case that can cause issues.
      {
        type: 'link',
        url: 'https://twitter.com/JustMissEmma/status/1448679899531726852',
        children: [{ text: 'Finally, here is our favorite dog video.' }],
      },
      { text: '' },
    ],
  },
]
const InlinesExample = () => {
  const editor = createMemo(() =>
    withInlines(withHistory(withSolid(createEditor()))),
  )

  const onKeyDown = (event: HTMLEvent<KeyboardEvent>) => {
    const { selection } = editor()

    // Default left/right behavior is unit:'character'.
    // This fails to distinguish between two cursor positions, such as
    // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
    // Here we modify the behavior to unit:'offset'.
    // This lets the user step into and out of the inline without stepping over characters.
    // You may wish to customize this further to only use unit:'offset' in specific cases.
    if (selection && Range.isCollapsed(selection)) {
      if (isKeyHotkey('left', event)) {
        event.preventDefault()
        Transforms.move(editor(), { unit: 'offset', reverse: true })
        return
      }
      if (isKeyHotkey('right', event)) {
        event.preventDefault()
        Transforms.move(editor(), { unit: 'offset' })
        return
      }
    }
  }

  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Toolbar>
        <AddLinkButton />
        <RemoveLinkButton />
        <ToggleEditableButtonButton />
      </Toolbar>
      <Editable
        renderElement={props => <Element {...props} />}
        renderLeaf={props => <Text {...props} />}
        placeholder="Enter some text..."
        onKeyDown={onKeyDown}
      />
    </Slate>
  )
}

const withInlines = (editor: Editor) => {
  const { insertData, insertText, isInline, isElementReadOnly, isSelectable } =
    editor

  editor.isInline = element =>
    ['link', 'button', 'badge'].includes(element.type) || isInline(element)

  editor.isElementReadOnly = element =>
    element.type === 'badge' || isElementReadOnly(element)

  editor.isSelectable = element =>
    element.type !== 'badge' && isSelectable(element)

  editor.insertText = text => {
    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertText(text)
    }
  }

  editor.insertData = data => {
    const text = data.getData('text/plain')

    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

const insertLink = (editor: Editor, url: string) => {
  if (editor.selection) {
    wrapLink(editor, url)
  }
}

const insertButton = (editor: Editor) => {
  if (editor.selection) {
    wrapButton(editor)
  }
}

const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  })
  return !!link
}

const isButtonActive = (editor: Editor) => {
  const [button] = Editor.nodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'button',
  })
  return !!button
}

const unwrapLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  })
}

const unwrapButton = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'button',
  })
}

const wrapLink = (editor: Editor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor)
  }

  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  const link: LinkElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, link)
  } else {
    Transforms.wrapNodes(editor, link, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}

const wrapButton = (editor: Editor) => {
  if (isButtonActive(editor)) {
    unwrapButton(editor)
  }

  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  const button: ButtonElement = {
    type: 'button',
    children: isCollapsed ? [{ text: 'Edit me!' }] : [],
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, button)
  } else {
    Transforms.wrapNodes(editor, button, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
const InlineChromiumBugfix = () => (
  <span contentEditable={false} class={styles.InlineChromiumBugfix}>
    {String.fromCodePoint(160) /* Non-breaking space */}
  </span>
)

const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:']

const LinkComponent = (
  props: RenderElementProps & { element: LinkElement },
) => {
  const selected = useSelected()

  const safeUrl = createMemo(() => {
    let parsedUrl: URL | null = null
    try {
      parsedUrl = new URL(props.element.url)
      // eslint-disable-next-line no-empty
    } catch {}
    if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
      return parsedUrl.href
    }
    return 'about:blank'
  })

  return (
    <a
      {...props.attributes}
      href={safeUrl()}
      class={selected() ? styles.LinkComponentSelected : undefined}
    >
      <InlineChromiumBugfix />
      {props.children}
      <InlineChromiumBugfix />
    </a>
  )
}

const EditableButtonComponent = (props: RenderElementProps) => {
  return (
    /*
      Note that this is not a true button, but a span with button-like CSS.
      True buttons are display:inline-block, but Chrome and Safari
      have a bad bug with display:inline-block inside contenteditable:
      - https://bugs.webkit.org/show_bug.cgi?id=105898
      - https://bugs.chromium.org/p/chromium/issues/detail?id=1088403
      Worse, one cannot override the display property: https://github.com/w3c/csswg-drafts/issues/3226
      The only current workaround is to emulate the appearance of a display:inline button using CSS.
    */
    <span
      {...props.attributes}
      onClick={ev => ev.preventDefault()}
      class={styles.EditableButtonComponent}
    >
      <InlineChromiumBugfix />
      {props.children}
      <InlineChromiumBugfix />
    </span>
  )
}

const BadgeComponent = (props: RenderElementProps) => {
  const selected = useSelected()

  return (
    <span
      {...props.attributes}
      contentEditable={false}
      class={classNames(styles.BadgeComponent, selected() && styles.selected)}
      data-playwright-selected={selected}
    >
      <InlineChromiumBugfix />
      {props.children}
      <InlineChromiumBugfix />
    </span>
  )
}

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props

  const el = () => {
    switch (element.type) {
      case 'link':
        return (
          <LinkComponent
            {...(props as RenderElementProps & { element: LinkElement })}
          />
        )
      case 'button':
        return <EditableButtonComponent {...props} />
      case 'badge':
        return <BadgeComponent {...props} />
      default:
        return <p {...attributes}>{children}</p>
    }
  }

  return <>{el()}</>
}

const Text = (props: RenderLeafProps) => {
  return (
    <span
      // The following is a workaround for a Chromium bug where,
      // if you have an inline at the end of a block,
      // clicking the end of a block puts the cursor inside the inline
      // instead of inside the final {text: ''} node
      // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
      class={props.leaf.text === '' ? styles.Text : undefined}
      {...props.attributes}
    >
      {props.children}
    </span>
  )
}

const AddLinkButton = () => {
  const editor = useSlate()
  return (
    <Button
      active={isLinkActive(editor())}
      onMouseDown={event => {
        event.preventDefault()
        const url = window.prompt('Enter the URL of the link:')
        if (!url) return
        insertLink(editor(), url)
      }}
    >
      <Icon children="link" />
    </Button>
  )
}

const RemoveLinkButton = () => {
  const editor = useSlate()

  return (
    <Button
      active={isLinkActive(editor())}
      onMouseDown={() => {
        if (isLinkActive(editor())) {
          unwrapLink(editor())
        }
      }}
    >
      <Icon children="link_off" />
    </Button>
  )
}

const ToggleEditableButtonButton = () => {
  const editor = useSlate()
  return (
    <Button
      active
      onMouseDown={event => {
        event.preventDefault()
        if (isButtonActive(editor())) {
          unwrapButton(editor())
        } else {
          insertButton(editor())
        }
      }}
    >
      <Icon children="smart_button" />
    </Button>
  )
}

export default InlinesExample
