import { Range } from 'slate'
import type { DOMRange } from 'slate-dom'
import scrollIntoView from 'scroll-into-view-if-needed'
import type { SolidEditor } from '../plugin/solid-editor'

/**
 * A default implement to scroll dom range into view.
 */
export function defaultScrollSelectionIntoView(
  editor: SolidEditor,
  domRange: DOMRange,
) {
  // This was affecting the selection of multiple blocks and dragging behavior,
  // so enabled only if the selection has been collapsed.
  if (
    domRange.getBoundingClientRect &&
    (!editor.selection ||
      (editor.selection && Range.isCollapsed(editor.selection)))
  ) {
    const leafEl = domRange.startContainer.parentElement!
    leafEl.getBoundingClientRect = domRange.getBoundingClientRect.bind(domRange)
    scrollIntoView(leafEl, {
      scrollMode: 'if-needed',
    })

    // @ts-expect-error an unorthodox delete D:
    delete leafEl.getBoundingClientRect
  }
}
