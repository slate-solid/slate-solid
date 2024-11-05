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
      {/* <Show when={!(IS_ANDROID || IS_IOS) || !props.isLineBreak}>
        {'\uFEFF'}
      </Show> */}
      {/*
      TODO: This fixes an what seems to be an IOS bug in slate-react where the
      length `domRange.setStart(startNode, isStartAtZeroWidth ? 1 : startOffset)`
      gets called on a zero length string. Removing the `IS_IOS` check keeps the
      BOM character which has a 1 length string and fixes the error, but I'm not
      sure what the intent of the original check was or if this causes other
      issues. Also not sure if android has same issue. Trying this for now. I
      may file a bug with slate. Tracking here for now
      `slate-solid/slate-solid/issues/11`
      */}
      <Show when={!IS_ANDROID || !props.isLineBreak}>{'\uFEFF'}</Show>
      <Show when={props.isLineBreak}>
        <br />
      </Show>
    </span>
  )
}
