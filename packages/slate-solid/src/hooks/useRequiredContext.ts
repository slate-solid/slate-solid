import { useContext, type Context } from 'solid-js'

export function useRequiredContext<T>(
  context: Context<T | null>,
  name: string,
  message?: string,
): T {
  const maybeContext = useContext(context)

  if (maybeContext == null) {
    throw new Error(message ?? `No context value found for ${name}.`)
  }

  return maybeContext
}
