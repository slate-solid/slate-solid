import {
  BsPlus,
  Bs1SquareFill,
  Bs2SquareFill,
  BsInputCursor,
  BsJustify,
  BsListOl,
  BsListUl,
  BsTypeBold,
  BsCode,
  BsQuote,
  BsTextCenter,
  BsTextLeft,
  BsTextRight,
  BsTypeItalic,
  BsTypeUnderline,
  BsSearch,
  BsImage,
  BsTrash,
  BsLink,
} from 'solid-icons/bs'
import { IoUnlink } from 'solid-icons/io'
import { Dynamic } from 'solid-js/web'

export interface IconProps {
  class?: string
  ref?: HTMLSpanElement
  size?: number
  children: IconType
}

export const iconTypeMap = {
  add: BsPlus,
  delete: BsTrash,
  format_bold: BsTypeBold,
  format_italic: BsTypeItalic,
  format_underlined: BsTypeUnderline,
  image: BsImage,
  link: BsLink,
  link_off: IoUnlink,
  code: BsCode,
  search: BsSearch,
  smart_button: BsInputCursor,
  // Blocks
  looks_one: Bs1SquareFill,
  looks_two: Bs2SquareFill,
  format_quote: BsQuote,
  format_list_numbered: BsListOl,
  format_list_bulleted: BsListUl,
  // Text align
  format_align_left: BsTextLeft,
  format_align_center: BsTextCenter,
  format_align_right: BsTextRight,
  format_align_justify: BsJustify,
}

export type IconType = keyof typeof iconTypeMap

export function Icon(props: IconProps) {
  return (
    <Dynamic
      class={props.class}
      size={props.size}
      component={iconTypeMap[props.children]}
    />
  )
}
