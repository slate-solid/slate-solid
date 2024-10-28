import {
  Editable,
  Slate,
  withSolid
} from '@slate-solid/core'
import { createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { createMemo, createSignal } from 'solid-js'
import styles from './styling.module.css'

const StylingExample = () => {
  const editor1 = createMemo(() => withHistory(withSolid(createEditor())), [])
  const editor2 = createMemo(() => withHistory(withSolid(createEditor())), [])
  return (
    <div style={{ display: 'flex', "flex-direction": 'column', gap: '40px' }}>
      <Slate
        editor={editor1()}
        initialValue={[
          {
            type: 'paragraph',
            children: [{ text: 'This editor is styled using the style prop.' }],
          },
        ]}
      >
        <Editable
          style={{
            "background-color": 'rgb(255, 230, 156)',
            "min-height": '200px',
            outline: 'rgb(0, 128, 0) solid 2px',
          }}
        />
      </Slate>

      <Slate
        editor={editor2()}
        initialValue={[
          {
            type: 'paragraph',
            children: [
              { text: 'This editor is styled using the className prop.' },
            ],
          },
        ]}
      >
        <Editable class={styles.fancy} disableDefaultStyles />
      </Slate>
    </div>
  )
}
export default StylingExample