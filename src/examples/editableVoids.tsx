import { createMemo, createSignal, Match, Switch } from 'solid-js'
import { Transforms, createEditor, Descendant, type Editor } from 'slate'
import {
  Slate,
  Editable,
  useSlateStatic,
  withSolid,
  type RenderElementProps,
} from '@slate-solid/core'
import { withHistory } from 'slate-history'

import { RichTextExample } from './richText'
import { Button, Icon, Toolbar } from './components'
import { EditableVoidElement } from './custom-types'
import styles from './editableVoids.module.css'

const EditableVoidsExample = () => {
  const editor = createMemo(() =>
    withEditableVoids(withHistory(withSolid(createEditor()))),
  )

  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Toolbar>
        <InsertEditableVoidButton />
      </Toolbar>

      <Editable
        renderElement={props => <Element {...props} />}
        placeholder="Enter some text..."
      />
    </Slate>
  )
}

const withEditableVoids = (editor: Editor) => {
  const { isVoid } = editor

  editor.isVoid = element => {
    return element.type === 'editable-void' ? true : isVoid(element)
  }

  return editor
}

const insertEditableVoid = (editor: Editor) => {
  const text = { text: '' }
  const voidNode: EditableVoidElement = {
    type: 'editable-void',
    children: [text],
  }
  Transforms.insertNodes(editor, voidNode)
}

const Element = (props: RenderElementProps) => {
  return (
    <Switch fallback={<p {...props.attributes}>{props.children}</p>}>
      <Match when={props.element.type === 'editable-void'}>
        <EditableVoid {...props} />
      </Match>
    </Switch>
  )
}

const EditableVoid = (props: RenderElementProps) => {
  const [inputValue, setInputValue] = createSignal('')

  return (
    // Need contentEditable=false or Firefox has issues with certain input types.
    <div {...props.attributes} contentEditable={false}>
      <div class={styles.form}>
        <h4>Name:</h4>
        <input
          class={styles.inputText}
          type="text"
          value={inputValue()}
          onChange={e => {
            setInputValue(e.target.value)
          }}
        />
        <h4>Left or right handed:</h4>
        <input
          class={styles.unsetWidthStyle}
          type="radio"
          name="handedness"
          value="left"
        />{' '}
        Left
        <br />
        <input
          class={styles.unsetWidthStyle}
          type="radio"
          name="handedness"
          value="right"
        />{' '}
        Right
        <h4>Tell us about yourself:</h4>
        <div class={styles.editorWrapper}>
          <RichTextExample />
        </div>
      </div>
      {props.children}
    </div>
  )
}

const InsertEditableVoidButton = () => {
  const editor = useSlateStatic()
  return (
    <Button
      onMouseDown={event => {
        event.preventDefault()
        insertEditableVoid(editor())
      }}
    >
      <Icon size={24} children="add" />
    </Button>
  )
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'In addition to nodes that contain editable text, you can insert void nodes, which can also contain editable elements, inputs, or an entire other Slate editor.',
      },
    ],
  },
  {
    type: 'editable-void',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
]

export default EditableVoidsExample
