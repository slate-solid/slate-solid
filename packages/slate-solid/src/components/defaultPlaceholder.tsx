import { IS_ANDROID } from 'slate-dom'
import type { RenderPlaceholderProps } from './propTypes'

/**
 * The default placeholder element
 */
export function DefaultPlaceholder(props: RenderPlaceholderProps) {
  // COMPAT: Artificially add a line-break to the end on the placeholder element
  // to prevent Android IMEs to pick up its content in autocorrect and to auto-capitalize the first letter
  return (
    <span {...props.attributes}>
      {props.children}
      {IS_ANDROID && <br />}
    </span>
  )
}
