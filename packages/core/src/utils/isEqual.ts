/**
 * Slight optimization such that empty arrays match regardless of reference
 * equality.
 */
export function isArrayEqual<T>(a: T[], b: T[]) {
  return a.length === b.length || a === b
}

/**
 * Compare JSON.stringify values of 2 objects and return true if equal.
 */
export function isJsonStringEqual<T>(a: T, b: T) {
  return JSON.stringify(a) === JSON.stringify(b)
}
