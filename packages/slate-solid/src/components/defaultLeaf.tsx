import type { RenderLeafProps } from './propTypes'

export const DefaultLeaf = (props: RenderLeafProps) => {
  return <span {...props.attributes}>{props.children}</span>
}
