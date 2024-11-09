import { createEditor, Descendant } from 'slate'
import { Slate, Editable, withSolid } from '@slate-solid/core'
import { withHistory } from 'slate-history'
import { render } from 'solid-js/web'
import { createMemo } from 'solid-js'

const ShadowDOM = () => {
  const ref = (container: HTMLDivElement) => {
    if (container.shadowRoot) return

    // Create a shadow DOM
    const outerShadowRoot = container.attachShadow({ mode: 'open' })
    const host = document.createElement('div')
    outerShadowRoot.appendChild(host)

    // Create a nested shadow DOM
    const innerShadowRoot = host.attachShadow({ mode: 'open' })
    const solidRoot = document.createElement('div')
    innerShadowRoot.appendChild(solidRoot)

    // Render the editor within the nested shadow DOM
    render(() => <ShadowEditor />, solidRoot)
  }

  return <div ref={ref} data-cy="outer-shadow-root" />
}

const ShadowEditor = () => {
  const editor = createMemo(() => withHistory(withSolid(createEditor())))

  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Editable placeholder="Enter some plain text..." />
    </Slate>
  )
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'This Editor is rendered within a nested Shadow DOM.' }],
  },
]

export default ShadowDOM
