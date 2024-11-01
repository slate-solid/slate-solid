/**
 * Slight optimization such that empty arrays match regardless of reference
 * equality.
 */
export function isArrayEqual<T>(a: T[], b: T[]) {
  return a.length === b.length || a === b
}
