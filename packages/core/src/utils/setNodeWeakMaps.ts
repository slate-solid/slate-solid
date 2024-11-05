import { Ancestor, Text, type Operation } from 'slate'
import { NODE_TO_INDEX, NODE_TO_PARENT } from 'slate-dom'
import type { SolidEditor } from '../plugin/solid-editor'
import { EDITOR_TO_CHILDREN, NODE_TO_PATH } from './weakMaps'

/**
 * Set WeakMap entries related to nodes in the Slate data model. These provide
 * easy access to nodes + related objects without having to traverse the node
 * tree every time. This should be called on the initial state tree, and then
 * again any time the node tree changes.
 */
export function setNodeWeakMaps(editor: SolidEditor, operation?: Operation) {
  // Track when Editor.children ref is updated
  const childrenRefChanged = EDITOR_TO_CHILDREN.get(editor) !== editor.children
  EDITOR_TO_CHILDREN.set(editor, editor.children)

  // If children ref hasn't changed, no need to update node WeakMaps
  if (!childrenRefChanged) {
    return
  }

  // Optimization to only process sub trees for certain operations. e.g. a text
  // only change should only impact its ancestor tree. Other direct child nodes
  // of the editor should not be impacted and can be skipped over.
  let childFilterIndex = getTopLevelFilterIndex(operation)

  // Traverse the node tree (or sub-tree if childFilterIndex is not null).
  // Using a queue to avoid recursive function calls.
  const queue: [Ancestor, number[]][] = [[editor, []]]
  while (queue.length > 0) {
    const [parent, parentPath] = queue.shift()!
    const children = parent.children

    for (let i = 0; i < children.length; ++i) {
      // If we are applying a filter and this index is not in it, skip it.
      if (childFilterIndex && !childFilterIndex.has(i)) {
        continue
      }

      const child = children[i]

      const childPath = [...parentPath, i]

      if (!Text.isText(child)) {
        queue.push([child, childPath])
      }

      NODE_TO_INDEX.set(child, i)
      NODE_TO_PARENT.set(child, parent)
      NODE_TO_PATH.set(child, childPath)
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
function getTopLevelFilterIndex(operation?: Operation): Set<number> | null {
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
    case 'set_node':
    case 'split_node':
      return null

    // Text change operations should only impact the top-level child node downward,
    // So should be able to just target that sub tree.
    case 'insert_text':
    case 'remove_text': {
      return new Set([operation.path[0]])
    }

    // When setting selection, determine a Set of top level child indices
    // included in the selection.
    case 'set_selection': {
      // If we ever get here, but there is no selection, we don't really have a
      // way to know what has changed in children, so don't filter the update.
      if (
        operation.newProperties?.anchor == null &&
        operation.newProperties?.focus == null
      ) {
        return null
      }

      const a = operation.newProperties.anchor?.path[0]
      const f = operation.newProperties.focus?.path[0]

      const bounds: number[] = [a, f].filter(n => n != null).sort()

      if (bounds.length < 2) {
        return new Set(bounds)
      }

      const [start, end] = bounds

      const set = new Set<number>()
      for (let i = start; i <= end; ++i) {
        set.add(i)
      }

      return set
    }
  }
}
