import { createMemo, createSignal } from 'solid-js'
import {
  Transforms,
  createEditor,
  Element as SlateElement,
  Descendant,
  type Editor,
} from 'slate'
import {
  Slate,
  Editable,
  withSolid,
  useSlateStatic,
  SolidEditor,
  type RenderElementProps,
} from '@slate-solid/slate-solid'
import type { VideoElement as VideoElementType } from './custom-types'

const EmbedsExample = () => {
  const editor = createMemo(() => withEmbeds(withSolid(createEditor())))
  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Editable
        renderElement={(props) => <Element {...props} />}
        placeholder="Enter some text..."
      />
    </Slate>
  )
}

const withEmbeds = (editor: Editor) => {
  const { isVoid } = editor
  editor.isVoid = (element) =>
    element.type === 'video' ? true : isVoid(element)
  return editor
}

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props
  switch (props.element.type) {
    case 'video':
      return (
        <VideoElement
          {...(props as RenderElementProps & { element: VideoElementType })}
        />
      )
    default:
      return <p {...attributes}>{children}</p>
  }
}

const allowedSchemes = ['http:', 'https:']

const VideoElement = (
  props: RenderElementProps & { element: VideoElementType },
) => {
  const editor = useSlateStatic()

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
    <div {...props.attributes}>
      <div contentEditable={false}>
        <div
          style={{
            padding: '75% 0 0 0',
            position: 'relative',
          }}>
          <iframe
            src={`${safeUrl()}?title=0&byline=0&portrait=0`}
            // @ts-ignore
            frameborder="0"
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
            }}
          />
        </div>
        <UrlInput
          url={props.element.url}
          onChange={(val) => {
            const path = SolidEditor.findPath(editor(), props.element)
            const newProperties: Partial<SlateElement> = {
              url: val,
            }
            Transforms.setNodes<SlateElement>(editor(), newProperties, {
              at: path,
            })
          }}
        />
      </div>
      {props.children}
    </div>
  )
}

const UrlInput = (props: { url: string; onChange: (url: string) => void }) => {
  const [value, setValue] = createSignal(props.url)
  return (
    <input
      value={value()}
      onClick={(e) => e.stopPropagation()}
      style={{
        'margin-top': '5px',
        'box-sizing': 'border-box',
      }}
      onChange={(e) => {
        const newUrl = e.target.value
        setValue(newUrl)
        props.onChange(newUrl)
      }}
    />
  )
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'In addition to simple image nodes, you can actually create complex embedded nodes. For example, this one contains an input element that lets you change the video being rendered!',
      },
    ],
  },
  {
    type: 'video',
    url: 'https://player.vimeo.com/video/26689853',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Try it out! This editor is built to handle Vimeo embeds, but you could handle any type.',
      },
    ],
  },
]

export default EmbedsExample
