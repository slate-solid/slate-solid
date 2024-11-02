import type { Node } from 'slate'

/** Stores paths of nodes */
export const NODE_TO_PATH: WeakMap<Node, number[]> = new WeakMap()
