import { createMemo } from 'solid-js'
import { Slate, Editable, withSolid } from '@slate-solid/slate-solid'
import { createEditor, Descendant } from 'slate'

const ReadOnlyExample = () => {
  const editor = createMemo(() => withSolid(createEditor()))
  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Editable readOnly placeholder="Enter some plain text..." />
    </Slate>
  )
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'This example shows what happens when the Editor is set to readOnly, it is not editable',
      },
    ],
  },
]

export default ReadOnlyExample
