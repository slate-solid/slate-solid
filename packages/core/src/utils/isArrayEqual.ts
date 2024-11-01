export function isArrayEqual<T>(a: T[], b: T[]) {
  return a.length === b.length || a === b
}
