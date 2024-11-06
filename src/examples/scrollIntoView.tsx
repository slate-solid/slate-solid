import { faker } from '@faker-js/faker'
import {
  Editable,
  Slate,
  SolidEditor,
  withSolid,
  type HTMLEvent,
  type RenderElementProps,
} from '@slate-solid/core'
import { Descendant, createEditor } from 'slate'
import { Match, Switch, createMemo } from 'solid-js'

const HEADINGS = 100
const PARAGRAPHS = 7
const initialValue: Descendant[] = []

for (let h = 0; h < HEADINGS; h++) {
  initialValue.push({
    type: 'heading',
    children: [{ text: faker.lorem.sentence() }],
  })

  for (let p = 0; p < PARAGRAPHS; p++) {
    initialValue.push({
      type: 'paragraph',
      children: [{ text: faker.lorem.paragraph() }],
    })
  }
}

const ScrollIntoViewExample = () => {
  const renderElement = (props: RenderElementProps) => <Element {...props} />
  const editor = createMemo(() => withSolid(createEditor()))

  const scrollToSelection = (event: HTMLEvent<MouseEvent>) => {
    const { selection } = editor()
    const root = SolidEditor.findDocumentOrShadowRoot(editor())
    const domSelection = getSelection()
    console.log(domSelection, root, selection)

    if (domSelection?.anchorNode)
      domSelection?.anchorNode.parentElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

    event.preventDefault()
  }



  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <span>Make a selection then click the button</span>
      <span><button onMouseDown={scrollToSelection}>Scroll To Selection</button></span>
      <Editable renderElement={renderElement} spellcheck autofocus />
    </Slate>
  )
}

const Element = (props: RenderElementProps) => {
  return (
    <Switch fallback={<p {...props.attributes}>{props.children}</p>}>
      <Match when={props.element.type === 'heading'}>
        <h1 {...props.attributes}>{props.children}</h1>
      </Match>
    </Switch>
  )
}

export default ScrollIntoViewExample
