import { IS_ANDROID, IS_IOS } from 'slate-dom'
import { createMemo, mergeProps, Show } from 'solid-js'

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

  const attributes = createMemo(() => {
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

    return attributes
  })

  return (
    <span {...attributes()}>
      <Show when={!(IS_ANDROID || IS_IOS) || !props.isLineBreak}>
        {'\uFEFF'}
      </Show>
      <Show when={props.isLineBreak}>
        <br />
      </Show>
    </span>
  )
}
