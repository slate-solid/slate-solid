import {
  Editable,
  Slate,
  withSolid
} from '@slate-solid/core'
import { Descendant, createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { createMemo, createSignal } from 'solid-js'

const PlainTextExample = () => {
  const editor = createMemo(() => withHistory(withSolid(createEditor())), [])
  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Editable placeholder="Enter some plain text..." />
    </Slate>
  )
}
const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable plain text, just like a <textarea>!' },
    ],
  },
]
export default PlainTextExample