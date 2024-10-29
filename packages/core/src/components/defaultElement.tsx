/**
 * The default element renderer.
 */
import { useSlateStatic } from '../hooks/useSlateStatic'
import { DynamicElement } from './html'
import type { RenderElementProps } from './propTypes'

export const DefaultElement = (props: RenderElementProps) => {
  const editor = useSlateStatic()

  const elType = () => (editor().isInline(props.element) ? 'span' : 'div')

  return (
    <DynamicElement {...props.attributes} type={elType()}>
      {props.children}
    </DynamicElement>
  )
}
