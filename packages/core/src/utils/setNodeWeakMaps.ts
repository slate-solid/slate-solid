import {
  Ancestor,
  Text,
  type Operation,
  type SetNodeOperation,
  type SetSelectionOperation,
} from 'slate'
import { NODE_TO_INDEX, NODE_TO_PARENT } from 'slate-dom'
import type { SolidEditor } from '../plugin/solid-editor'

/**
 * Set WeakMap entries related to nodes in the Slate data model. These provide
 * easy access to nodes + related objects without having to traverse the node
 * tree every time. This should be called on the initial state tree, and then
 * again any time the node tree changes.
 */
export function setNodeWeakMaps(editor: SolidEditor, operation?: Operation) {
  // Node tree shouldn't change on these operations
  if (operation?.type === 'set_selection' || operation?.type === 'set_node') {
    return
  }

  // Optimization to only process sub trees for certain operations. e.g. a text
  // only change should only impact its ancestor tree. Other direct child nodes
  // of the editor should not be impacted and can be skipped over.
  let childFilterIndex = getTopLevelFilterIndex(operation)

  // Traverse the node tree (or sub-tree if childFilterIndex is not null).
  // Using a queue to avoid recursive function calls.
  const queue: Ancestor[] = [editor]
  while (queue.length > 0) {
    const parent = queue.shift()!
    const children = parent.children

    for (let i = 0; i < children.length; ++i) {
      if (childFilterIndex && i !== childFilterIndex) {
        continue
      }

      const child = children[i]

      if (!Text.isText(child)) {
        queue.push(child)
      }

      NODE_TO_INDEX.set(child, i)
      NODE_TO_PARENT.set(child, parent)
    }

    // Only applies to top level, so clear any existing filter
    childFilterIndex = null
  }
}

/**
 * Get a filter index for direct child of Editor based on an operations. The
 * idea here is that some operations should only require updating refs on a sub
 * tree of the state tree.
 * @param operation Optional operation to determine the filter index.
 * @returns an index of the direct Editor child to process if an optimization
 * can be identified. Otherwise returns null which means process everything.
 */
function getTopLevelFilterIndex(
  operation?: Exclude<Operation, SetNodeOperation | SetSelectionOperation>,
): number | null {
  if (operation == null) {
    return null
  }

  switch (operation.type) {
    // TODO: There's probably more optimization that can be done for these
    // operations, but there's likely edge cases to be thought through. Leaving
    // unfiltered for now until we experience any actual performance issues that
    // need further optimization.
    case 'insert_node':
    case 'merge_node':
    case 'move_node':
    case 'remove_node':
    case 'split_node':
      return null

    // Text change operations should only impact the top-level child node downward,
    // So should be able to just target that sub tree.
    case 'insert_text':
    case 'remove_text': {
      return operation.path[0]
    }
  }
}
