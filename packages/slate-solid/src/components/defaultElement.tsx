/**
 * The default element renderer.
 */

import { useSlateStatic } from '../hooks/use-slate-static'
import { Div, Span } from './html'
import type { RenderElementProps } from './propTypes'

export const DefaultElement = (props: RenderElementProps) => {
  const { attributes, children, element } = props
  const editor = useSlateStatic()
  const Tag = editor().isInline(element) ? Span : Div
  return (
    <Tag {...attributes} style={{ position: 'relative' }}>
      {children}
    </Tag>
  )
}
