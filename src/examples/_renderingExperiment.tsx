import { createSignal, For } from 'solid-js'

/**
 * Minimal example to see how dom updates when a child node in a tree changes.
 */
export function RenderingExperimentSample() {
  const [children, setChildren] = createSignal(initialValue)

  const onClick = () => {
    const ch = children()
    // Update the reference of the first element
    setChildren([{ ...ch[0] }, ...ch.slice(1)])
  }

  return (
    <>
      <button onClick={onClick}>Change</button>
      <div class="editor">
        <For each={children()}>
          {el => (
            <div>
              {`<${el.type}>`}
              <For each={el.children}>{t => <span>{t.text}</span>}</For>
            </div>
          )}
        </For>
      </div>
    </>
  )
}

export default RenderingExperimentSample

const initialValue = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text: ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    align: 'center',
    children: [{ text: 'Try it out for yourself!' }],
  },
]
