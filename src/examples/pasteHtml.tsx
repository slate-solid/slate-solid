import { jsx } from 'slate-hyperscript'
import {
  Transforms,
  createEditor,
  Descendant,
  type Node,
  type Editor,
} from 'slate'
import { withHistory } from 'slate-history'
import {
  Slate,
  Editable,
  useSelected,
  useFocused,
  withSolid,
  type RenderElementProps,
  type RenderLeafProps,
} from '@slate-solid/core'
import type { DOMNode } from 'slate-dom'
import { createMemo, splitProps, type JSX } from 'solid-js'
import { classNames } from './utils/cssUtils'
import styles from './pasteHtml.module.css'
import { Leaf } from './richText'

const ELEMENT_TAGS = {
  A: (el: HTMLElement) => ({ type: 'link', url: el.getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: 'quote' }),
  H1: () => ({ type: 'heading-one' }),
  H2: () => ({ type: 'heading-two' }),
  H3: () => ({ type: 'heading-three' }),
  H4: () => ({ type: 'heading-four' }),
  H5: () => ({ type: 'heading-five' }),
  H6: () => ({ type: 'heading-six' }),
  IMG: (el: HTMLElement) => ({ type: 'image', url: el.getAttribute('src') }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'numbered-list' }),
  P: () => ({ type: 'paragraph' }),
  PRE: () => ({ type: 'code' }),
  UL: () => ({ type: 'bulleted-list' }),
}

type ElementTagKey = keyof typeof ELEMENT_TAGS

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS = {
  CODE: (_el: HTMLElement) => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
}

type TextTagKey = keyof typeof TEXT_TAGS

/** This type is kind of gnarly. Would be nice to refine better if possible. */
type DeserializedElement = string | null | Node | Descendant

export const deserialize = (
  el: DOMNode,
): DeserializedElement | DeserializedElement[] => {
  if (el.nodeType === 3) {
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  } else if (el.nodeName === 'BR') {
    return '\n'
  }

  const { nodeName } = el
  let parent = el

  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0]
  }
  let children = Array.from(parent.childNodes).map(deserialize).flat()

  if (children.length === 0) {
    children = [{ text: '' }]
  }

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children)
  }

  if (ELEMENT_TAGS[nodeName as ElementTagKey]) {
    const attrs = ELEMENT_TAGS[nodeName as ElementTagKey](el as HTMLElement)
    return jsx('element', attrs, children)
  }

  if (TEXT_TAGS[nodeName as TextTagKey]) {
    const attrs = TEXT_TAGS[nodeName as TextTagKey](el as HTMLElement)
    return children.map(child => jsx('text', attrs, child))
  }

  return children
}

const PasteHtmlExample = () => {
  const renderElement = (props: RenderElementProps) => <Element {...props} />
  const renderLeaf = (props: RenderLeafProps) => <Leaf {...props} />
  const editor = createMemo(() =>
    withHtml(withSolid(withHistory(createEditor()))),
  )
  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Paste in some HTML..."
      />
    </Slate>
  )
}

const withHtml = (editor: Editor) => {
  const { insertData, isInline, isVoid } = editor

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element)
  }

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.insertData = data => {
    const html = data.getData('text/html')

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html')
      const fragment = deserialize(parsed.body)
      Transforms.insertFragment(editor, fragment as Node[])
      return
    }

    insertData(data)
  }

  return editor
}

const Element = (props: RenderElementProps) => {
  switch (props.element.type) {
    default:
      return <p {...props.attributes}>{props.children}</p>
    case 'quote':
      return <blockquote {...props.attributes}>{props.children}</blockquote>
    case 'code':
      return (
        <pre>
          <code {...props.attributes}>{props.children}</code>
        </pre>
      )
    case 'bulleted-list':
      return <ul {...props.attributes}>{props.children}</ul>
    case 'heading-one':
      return <h1 {...props.attributes}>{props.children}</h1>
    case 'heading-two':
      return <h2 {...props.attributes}>{props.children}</h2>
    case 'heading-three':
      return <h3 {...props.attributes}>{props.children}</h3>
    case 'heading-four':
      return <h4 {...props.attributes}>{props.children}</h4>
    case 'heading-five':
      return <h5 {...props.attributes}>{props.children}</h5>
    case 'heading-six':
      return <h6 {...props.attributes}>{props.children}</h6>
    case 'list-item':
      return <li {...props.attributes}>{props.children}</li>
    case 'numbered-list':
      return <ol {...props.attributes}>{props.children}</ol>
    case 'link':
      return (
        <SafeLink href={props.element.url} {...props.attributes}>
          {props.children}
        </SafeLink>
      )
    case 'image':
      return <ImageElement {...props} />
  }
}

const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:']

const SafeLink = (
  propsOrig: RenderElementProps['attributes'] & {
    children: JSX.Element
    href: string
  },
) => {
  const [props, restProps] = splitProps(propsOrig, ['children', 'href'])

  const safeHref = createMemo(() => {
    let parsedUrl: URL | null = null
    try {
      parsedUrl = new URL(props.href)
      // eslint-disable-next-line no-empty
    } catch {}
    if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
      return parsedUrl.href
    }
    return 'about:blank'
  })

  return (
    <a href={safeHref()} {...restProps}>
      {props.children}
    </a>
  )
}

const ImageElement = (props: RenderElementProps) => {
  const selected = useSelected()
  const focused = useFocused()

  return (
    <div {...props.attributes}>
      {props.children}
      <img
        src={'url' in props.element ? props.element.url : ''}
        class={classNames(
          styles.image,
          selected() && focused() && styles.selected,
        )}
      />
    </div>
  )
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: "By default, pasting content into a Slate editor will use the clipboard's ",
      },
      { text: "'text/plain'", code: true },
      {
        text: " data. That's okay for some use cases, but sometimes you want users to be able to paste in content and have it maintain its formatting. To do this, your editor needs to handle ",
      },
      { text: "'text/html'", code: true },
      { text: ' data. ' },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: 'This is an example of doing exactly that!' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "Try it out for yourself! Copy and paste some rendered HTML rich text content (not the source code) from another site into this editor and it's formatting should be preserved.",
      },
    ],
  },
]

export default PasteHtmlExample
