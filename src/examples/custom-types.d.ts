import type { SolidEditor } from '@slate-solid/core'
import { Descendant, BaseEditor, BaseRange, Range, Element } from 'slate'
import { DOMEditor } from 'slate-dom'
import { HistoryEditor } from 'slate-history'

export type BlockQuoteElement = {
  type: 'block-quote'
  align?: string
  children: Descendant[]
}

export type BulletedListElement = {
  type: 'bulleted-list'
  align?: string
  children: Descendant[]
}

export type NumberedListElement = {
  type: 'numbered-list'
  align?: string
  children: Descendant[]
}

export type CheckListItemElement = {
  type: 'check-list-item'
  checked: boolean
  children: Descendant[]
}

export type EditableVoidElement = {
  type: 'editable-void'
  children: EmptyText[]
}

export type HeadingElement = {
  type: 'heading'
  align?: string
  children: Descendant[]
}

export type HeadingOneElement = {
  type: 'heading-one'
  align?: string
  children: Descendant[]
}

export type HeadingTwoElement = {
  type: 'heading-two'
  align?: string
  children: Descendant[]
}

export type ImageElement = {
  type: 'image'
  url: string
  children: EmptyText[]
}

export type LinkElement = { type: 'link'; url: string; children: Descendant[] }

export type ButtonElement = { type: 'button'; children: Descendant[] }

export type BadgeElement = { type: 'badge'; children: Descendant[] }

export type ListItemElement = { type: 'list-item'; children: Descendant[] }

export type MentionElement = {
  type: 'mention'
  character: string
  children: CustomText[]
}

export type ParagraphElement = {
  type: 'paragraph'
  align?: string
  children: Descendant[]
}

type TableRow = {}
type TableCell = {}

export type TableElement = { type: 'table'; children: TableRow[] }

export type TableCellElement = { type: 'table-cell'; children: CustomText[] }

export type TableRowElement = { type: 'table-row'; children: TableCell[] }

export type TitleElement = { type: 'title'; children: Descendant[] }

export type VideoElement = { type: 'video'; url: string; children: EmptyText[] }

export type CodeBlockElement = {
  type: 'code-block'
  language: string
  children: Descendant[]
}

export type CodeLineElement = {
  type: 'code-line'
  children: Descendant[]
}

type CustomElement =
  | BlockQuoteElement
  | BulletedListElement
  | CheckListItemElement
  | EditableVoidElement
  | HeadingElement
  | HeadingOneElement
  | HeadingTwoElement
  | ImageElement
  | LinkElement
  | ButtonElement
  | BadgeElement
  | ListItemElement
  | MentionElement
  | NumberedListElement
  | ParagraphElement
  | TableElement
  | TableRowElement
  | TableCellElement
  | TitleElement
  | VideoElement
  | CodeBlockElement
  | CodeLineElement

export type CustomText = {
  bold?: boolean
  italic?: boolean
  code?: boolean
  text: string
}

export type EmptyText = {
  text: string
}

export type BlockType = CustomElement['type']
export type ListType = 'bulleted-list' | 'numbered-list'
export type TextAlign = 'left' | 'center' | 'right' | 'justify'
export type MarkFormat = 'bold' | 'italic' | 'underline' | 'code'

export type BlockFormat = BlockType | TextAlign
export type Format = BlockFormat | MarkFormat

export type CustomEditor = BaseEditor &
  SolidEditor &
  HistoryEditor & {
    nodeToDecorations?: Map<Element, Range[]>
  }

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement & { align?: TextAlign }
    Text: CustomText | EmptyText
    Range: BaseRange & {
      [key: string]: unknown
    }
  }
}
