import {
  Editable,
  Slate,
  SolidEditor,
  useReadOnly,
  useSlateStatic,
  withSolid,
  type RenderElementProps,
} from '@slate-solid/slate-solid'
import {
  Editor,
  Transforms,
  Range,
  Point,
  createEditor,
  Descendant,
  Element as SlateElement,
} from 'slate'
import { withHistory } from 'slate-history'
import styles from './checkLists.module.css'
import { createMemo } from 'solid-js'
import { classNames } from './utils/cssUtils'

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
      },
    ],
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Slide to the left.' }],
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Slide to the right.' }],
  },
  {
    type: 'check-list-item',
    checked: false,
    children: [{ text: 'Criss-cross.' }],
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Criss-cross!' }],
  },
  {
    type: 'check-list-item',
    checked: false,
    children: [{ text: 'Cha cha real smooth…' }],
  },
  {
    type: 'check-list-item',
    checked: false,
    children: [{ text: "Let's go to work!" }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Try it out for yourself!' }],
  },
]

const CheckListsExample = () => {
  const renderElement = (props: RenderElementProps) => <Element {...props} />
  const editor = createMemo(() =>
    withChecklists(withHistory(withSolid(createEditor()))),
  )

  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Editable
        renderElement={renderElement}
        placeholder="Get to work…"
        spellcheck
        autofocus
      />
    </Slate>
  )
}

const withChecklists = (editor: Editor) => {
  const { deleteBackward } = editor

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === 'check-list-item',
      })

      if (match) {
        const [, path] = match
        const start = Editor.start(editor, path)

        if (Point.equals(selection.anchor, start)) {
          const newProperties: Partial<SlateElement> = {
            type: 'paragraph',
          }
          Transforms.setNodes(editor, newProperties, {
            match: (n) =>
              !Editor.isEditor(n) &&
              SlateElement.isElement(n) &&
              n.type === 'check-list-item',
          })
          return
        }
      }
    }

    deleteBackward(...args)
  }

  return editor
}

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props

  switch (element.type) {
    case 'check-list-item':
      return <CheckListItemElement {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

const CheckListItemElement = (props: RenderElementProps) => {
  const editor = useSlateStatic()
  const readOnly = useReadOnly()
  const checked = () => 'checked' in props.element && props.element.checked

  return (
    <div {...props.attributes} class={styles.CheckLists}>
      <span contentEditable={false} class={styles.checkBox}>
        <input
          type="checkbox"
          checked={checked()}
          onChange={(event) => {
            const path = SolidEditor.findPath(editor(), props.element)
            const newProperties: Partial<SlateElement> = {
              checked: event.target.checked,
            }
            Transforms.setNodes(editor(), newProperties, { at: path })
          }}
        />
      </span>
      <span
        contentEditable={!readOnly()}
        // suppressContentEditableWarning // TODO: This seems to be a React only thing?
        class={classNames(styles.label, checked() && styles.checked)}>
        {props.children}
      </span>
    </div>
  )
}

export default CheckListsExample
