/**
 * Conditional elements causes trouble for Solid's HMR.
 * e.g.
 * Tag = isInline ? 'span' : 'div'
 *
 * A workaround is to use wrappers
 * Tag = isInline ? Span : Div
 */

import { splitProps, type JSX } from 'solid-js'

type DivProps = JSX.HTMLAttributes<HTMLDivElement>

export function Div(props: DivProps) {
  return <div {...props} />
}

type SpanProps = JSX.HTMLAttributes<HTMLSpanElement>

export function Span(props: SpanProps) {
  return <span {...props} />
}
