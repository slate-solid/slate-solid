import { faker } from '@faker-js/faker'
import {
  Editable,
  Slate,
  withSolid,
  type RenderElementProps,
} from '@slate-solid/core'
import { createEditor, Descendant } from 'slate'
import { createMemo, Match, Switch } from 'solid-js'

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

const HugeDocumentExample = () => {
  const renderElement = (props: RenderElementProps) => <Element {...props} />
  const editor = createMemo(() => withSolid(createEditor()))
  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Editable renderElement={renderElement} spellcheck autoFocus />
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

export default HugeDocumentExample
