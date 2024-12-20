import isHotkey from 'is-hotkey'
import { Editable, withSolid, Slate, SolidEditor } from '@slate-solid/core'
import { createEditor, Descendant } from 'slate'
import { withHistory } from 'slate-history'

import { Toolbar } from './components'
import type {
  HTMLEvent,
  RenderElementProps,
  RenderLeafProps,
} from '@slate-solid/core'
import { createMemo, createSignal, Show, splitProps, type JSX } from 'solid-js'
import { Leaf, MarkButton, toggleMark } from './richText'
import { Portal } from 'solid-js/web'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
} as const

const IFrameExample = () => {
  const renderElement = (props: RenderElementProps) => (
    <p {...props.attributes}>{props.children}</p>
  )

  const renderLeaf = (props: RenderLeafProps) => <Leaf {...props} />

  const editor = createMemo(() => withHistory(withSolid(createEditor())))

  const handleBlur = () => SolidEditor.deselect(editor())

  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Toolbar>
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        <MarkButton format="code" icon="code" />
      </Toolbar>
      <IFrame onBlur={handleBlur}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some rich text…"
          spellcheck
          autofocus
          onKeyDown={event => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault()
                const mark = HOTKEYS[hotkey as keyof typeof HOTKEYS]
                toggleMark(editor(), mark)
              }
            }
          }}
        />
      </IFrame>
    </Slate>
  )
}

const IFrame = (propsOrig: JSX.IframeHTMLAttributes<HTMLIFrameElement>) => {
  const [props, restProps] = splitProps(propsOrig, ['children'])

  const [iframeBody, setIframeBody] = createSignal<HTMLElement>()

  const onLoad = (e: HTMLEvent<Event, HTMLIFrameElement>) => {
    console.log('Iframe')
    const { contentDocument } = e.target as HTMLIFrameElement
    setIframeBody(contentDocument?.body)
  }

  return (
    <iframe srcdoc={`<!DOCTYPE html>`} {...restProps} onLoad={onLoad}>
      <Show when={iframeBody()}>
        <Portal mount={iframeBody()}>{props.children}</Portal>
      </Show>
    </iframe>
  )
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'In this example, the document gets rendered into a controlled ',
      },
      { text: '<iframe>', code: true },
      {
        text: '. This is ',
      },
      {
        text: 'particularly',
        italic: true,
      },
      {
        text: ' useful, when you need to separate the styles for your editor contents from the ones addressing your UI.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'This also the only reliable method to preview any ',
      },
      {
        text: 'media queries',
        bold: true,
      },
      {
        text: ' in your CSS.',
      },
    ],
  },
]

export default IFrameExample
