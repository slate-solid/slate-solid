import type { Descendant, Editor, Node } from 'slate'

export const EDITOR_TO_CHILDREN = new WeakMap<Editor, Descendant[]>()

/** Stores paths of nodes */
export const NODE_TO_PATH: WeakMap<Node, number[]> = new WeakMap()
