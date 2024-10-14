export interface IconProps {
  class?: string
  ref?: HTMLSpanElement
  children: string
}

export function Icon(props: IconProps) {
  return (
    <span
      ref={props.ref}
      class={props.class}
      style={{
        'font-size': '18px',
        'vertical-align': 'text-bottom',
      }}
    />
  )
}
