import type { NodeEntry, Range } from 'slate'

/**
 * A default memoized decorate function.
 */
export const defaultDecorate: (entry: NodeEntry) => Range[] = () => []
