import imageExtensions from 'image-extensions'
import isUrl from 'is-url'
import isHotkey from 'is-hotkey'
import { Transforms, createEditor, Descendant, type Editor } from 'slate'
import {
  Slate,
  Editable,
  useSlateStatic,
  useSelected,
  useFocused,
  withSolid,
  SolidEditor,
  type RenderElementProps,
} from '@slate-solid/core'
import { withHistory } from 'slate-history'

import { Button, Icon, Toolbar } from './components'
import { ImageElement } from './custom-types.d'
import styles from './images.module.css'
import { createMemo } from 'solid-js'
import { classNames } from './utils/cssUtils'

const ImagesExample = () => {
  const editor = createMemo(() =>
    withImages(withHistory(withSolid(createEditor()))),
  )

  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Toolbar>
        <InsertImageButton />
      </Toolbar>
      <Editable
        onKeyDown={event => {
          if (isHotkey('mod+a', event)) {
            event.preventDefault()
            Transforms.select(editor(), [])
          }
        }}
        renderElement={props => <Element {...props} />}
        placeholder="Enter some text..."
      />
    </Slate>
  )
}

const withImages = (editor: Editor) => {
  const { insertData, isVoid } = editor

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.insertData = data => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result
            insertImage(editor, url?.toString() ?? '')
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

const insertImage = (editor: Editor, url: string) => {
  const text = { text: '' }
  const image: ImageElement = { type: 'image', url, children: [text] }
  Transforms.insertNodes(editor, image)
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }],
  })
}

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props

  switch (element.type) {
    case 'image':
      return <Image {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

const Image = (props: RenderElementProps) => {
  const editor = useSlateStatic()
  const path = () => SolidEditor.findPath(editor(), props.element)

  const selected = useSelected()
  const focused = useFocused()

  return (
    <div {...props.attributes}>
      {props.children}
      <div contentEditable={false} class={styles.imageContent}>
        <img
          src={'url' in props.element ? props.element.url : ''}
          class={classNames(
            styles.image,
            selected() && focused() && styles.selected,
          )}
        />
        <Button
          active
          onClick={() => Transforms.removeNodes(editor(), { at: path() })}
          class={classNames(
            styles.button,
            selected() && focused() && styles.selected,
          )}
        >
          <Icon children="delete" />
        </Button>
      </div>
    </div>
  )
}

const InsertImageButton = () => {
  const editor = useSlateStatic()
  return (
    <Button
      onMouseDown={event => {
        event.preventDefault()
        const url = window.prompt('Enter the URL of the image:')
        if (url && !isImageUrl(url)) {
          alert('URL is not an image')
          return
        }

        if (url) {
          insertImage(editor(), url)
        }
      }}
    >
      <Icon children="image" />
    </Button>
  )
}

const isImageUrl = (url: string) => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()!
  return imageExtensions.includes(ext)
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'In addition to nodes that contain editable text, you can also create other types of nodes, like images or videos.',
      },
    ],
  },
  {
    type: 'image',
    url: '/slate-solid-512.png',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'This example shows images in action. It features two ways to add images. You can either add an image via the toolbar icon above, or if you want in on a little secret, copy an image URL to your clipboard and paste it anywhere in the editor!',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'You can delete images with the cross in the top left. Try deleting this sheep:',
      },
    ],
  },
  {
    type: 'image',
    url: '/slate-solid-red-512.png',
    children: [{ text: '' }],
  },
]

export default ImagesExample
