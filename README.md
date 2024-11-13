# SlateSolid

<img alt="SlateSolid" src="src/assets/icons/slate-solid-96.png" width="48"> 🟰 <img alt="SlateJS" src="src/assets/icons/slate-96.png" width="48"> ➕
<img alt="SolidJS" src="src/assets/icons/solid48.png" width="48">

A _completely_ customizable framework
for building rich text editors using [SlateJS](https://docs.slatejs.org/) and [SolidJS](https://www.solidjs.com/).

> 🤖 **Slate is currently in beta.** See [SolidJS Github Repo](https://github.com/ianstormtaylor/slate).

> 🏗️ **SlateSolid is pre-release**. SlateSolid is modeled largely after `slate-react` but is still in active development to get to feature parity.

## Demo

Check out the [_SlateSolid_ live demo](https://slate-solid.github.io/slate-solid/)!

## Installation

Create a new SolidJS project (if you don't already have one)

```sh
npx degit solidjs/templates/ts my-app
cd my-app
npm i
```

Install peer dependencies:

```sh
npm install slate slate-dom
```

Install `SlateSolid`

```sh
npm install @slate-solid/core
```

Add this to `vite.config.ts`

```typescript
optimizeDeps: {
  include: ['is-hotkey', 'lodash/debounce', 'lodash/throttle'],
},
```

Minimal example:

```typescript
import { Editable, Slate, withSolid } from '@slate-solid/core'
import { createEditor } from 'slate'
import { createMemo } from 'solid-js'

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
]

export function App() {
  const editor = createMemo(() => withSolid(createEditor()))

  return (
    <Slate editor={editor()} initialValue={initialValue}>
      <Editable />
    </Slate>
  )
}

export default App
```
