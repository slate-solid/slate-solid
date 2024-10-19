import { IS_ANDROID, IS_IOS } from 'slate-dom'
import { mergeProps } from 'solid-js'

/**
 * Leaf strings without text, render as zero-width strings.
 */
export const ZeroWidthString = (origProps: {
  length?: number
  isLineBreak?: boolean
  isMarkPlaceholder?: boolean
}) => {
  const props = mergeProps(
    { length: 0, isLineBreak: false, isMarkPlaceholder: false },
    origProps,
  )

  const attributes: {
    'data-slate-zero-width': string
    'data-slate-length': number
    'data-slate-mark-placeholder'?: boolean
  } = {
    'data-slate-zero-width': props.isLineBreak ? 'n' : 'z',
    'data-slate-length': length,
  }

  if (props.isMarkPlaceholder) {
    attributes['data-slate-mark-placeholder'] = true
  }

  return (
    <span {...attributes}>
      {!(IS_ANDROID || IS_IOS) || !props.isLineBreak ? '\uFEFF' : null}
      {props.isLineBreak ? <br /> : null}
    </span>
  )
}
