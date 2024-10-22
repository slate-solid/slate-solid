import type { JSX } from 'solid-js'
import type { Element, Text } from 'slate'

export interface RenderElementProps {
  children: any
  element: Element
  attributes: {
    'data-slate-node': 'element'
    'data-slate-inline'?: true
    'data-slate-void'?: true
    dir?: 'rtl'
    ref: any
  }
}

/**
 * `RenderLeafProps` are passed to the `renderLeaf` handler.
 */

export interface RenderLeafProps {
  children: any
  leaf: Text
  text: Text
  attributes: {
    'data-slate-leaf': true
  }
}

// This is copied from `React` types. TBD whether we actually need it.
// Bivariance hack for consistent unsoundness with RefObject
type RefCallback<T> = {
  bivarianceHack(instance: T | null): void
}['bivarianceHack']

/**
 * The props that get passed to renderPlaceholder
 */
export type RenderPlaceholderProps = {
  children: any
  attributes: {
    'data-slate-placeholder': boolean
    dir?: 'rtl'
    contentEditable: boolean
    ref: RefCallback<any>
    style: JSX.CSSProperties
  }
}
