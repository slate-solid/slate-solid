import { BaseRange, BaseText } from 'slate'
import { SolidEditor } from '@slate-solid/slate-solid'

declare module 'slate' {
  interface CustomTypes {
    Editor: SolidEditor
    Text: BaseText & {
      placeholder?: string
      onPlaceholderResize?: (node: HTMLElement | null) => void
      // FIXME: is unknown correct here?
      [key: string]: unknown
    }
    Range: BaseRange & {
      placeholder?: string
      onPlaceholderResize?: (node: HTMLElement | null) => void
      // FIXME: is unknown correct here?
      [key: string]: unknown
    }
  }
}

declare global {
  interface Window {
    MSStream: boolean
  }
  interface DocumentOrShadowRoot {
    getSelection(): Selection | null
  }

  interface CaretPosition {
    readonly offsetNode: Node
    readonly offset: number
    getClientRect(): DOMRect | null
  }

  interface Document {
    caretPositionFromPoint(x: number, y: number): CaretPosition | null
  }

  interface Node {
    getRootNode(options?: GetRootNodeOptions): Document | ShadowRoot
  }
}

export {}
