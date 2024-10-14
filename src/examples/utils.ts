/**
 * Create space delimited class string from an array of strings.
 */
export function classNames(
  ...names: (string | false | null | undefined)[]
): string {
  return names.filter(Boolean).join(' ')
}
