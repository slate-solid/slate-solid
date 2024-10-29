/**
 * Conditional elements causes trouble for Solid's HMR.
 * e.g.
 * Tag = isInline ? 'span' : 'div'
 *
 * A workaround is to use wrapper components instead of the native elements
 * directly.
 * Tag = isInline ? Span : Div
 */

import { splitProps, type JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'

/* div component */
type DivProps = JSX.HTMLAttributes<HTMLDivElement>
export function Div(props: DivProps) {
  return <div {...props} />
}

/** span component */
type SpanProps = JSX.HTMLAttributes<HTMLSpanElement>
export function Span(props: SpanProps) {
  return <span {...props} />
}

/**
 * Map element type to component.
 */
const elementTypeMap = {
  div: Div,
  span: Span,
}

type ElementTypeMap = typeof elementTypeMap

type TypeProps<TType extends keyof ElementTypeMap, TProps> = {
  type: TType
} & TProps

type DynamicElementProps =
  | TypeProps<'div', DivProps>
  | TypeProps<'span', SpanProps>

export function DynamicElement(origProps: DynamicElementProps) {
  const [props, restProps] = splitProps(origProps, ['type', 'children'])

  return (
    <Dynamic {...restProps} component={elementTypeMap[props.type]}>
      {props.children}
    </Dynamic>
  )
}
