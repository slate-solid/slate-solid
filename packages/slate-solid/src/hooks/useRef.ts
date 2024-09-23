export type MutableRefObject<T> = {
  current: T
}

/**
 * In general SolidJS doesn't need refs in the same way React does since we can
 * typically just use a plain variable as a ref. This hook serves to make it
 * easier to port React code to SolidJS where we want to be able to set / get
 * the `current` prop on a ref.
 */
export function useRef<T>(): MutableRefObject<T | undefined>
export function useRef<T>(initialValue: T): MutableRefObject<T>
export function useRef<T>(initialValue?: T): MutableRefObject<T | undefined> {
  return {
    current: initialValue,
  }
}
