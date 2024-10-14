// const refEquality = (a: any, b: any) => a === b

/**
 * use redux style selectors to prevent rerendering on every keystroke.
 * Bear in mind rerendering can only prevented if the returned value is a value type or for reference types (e.g. objects and arrays) add a custom equality function.
 *
 * Example:
 * ```
 *  const isSelectionActive = useSlateSelector(editor => Boolean(editor.selection));
 * ```
 */
// export function useSlateSelector<T>(
//   selector: (editor: Editor) => T,
//   equalityFn: (a: T, b: T) => boolean = refEquality,
// ) {
//   const [, forceRender] = useReducer((s) => s + 1, 0)

//   const context = useContext(SlateSelectorContext)!
//   if (!context) {
//     throw new Error(
//       `The \`useSlateSelector\` hook must be used inside the <Slate> component's context.`,
//     )
//   }

//   const latestSubscriptionCallbackError = useRef<Error | undefined>()
//   const latestSelector = useRef<(editor: Editor) => T>(() => null as any)
//   const latestSelectedState = useRef<T>(null as any as T)
//   let selectedState: T

//   try {
//     if (
//       selector !== latestSelector.current ||
//       latestSubscriptionCallbackError.current
//     ) {
//       selectedState = selector(context.getSlate())
//     } else {
//       selectedState = latestSelectedState.current
//     }
//   } catch (err) {
//     if (latestSubscriptionCallbackError.current && isError(err)) {
//       err.message += `\nThe error may be correlated with this previous error:\n${latestSubscriptionCallbackError.current.stack}\n\n`
//     }

//     throw err
//   }
//   createEffect(() => {
//     latestSelector.current = selector
//     latestSelectedState.current = selectedState
//     latestSubscriptionCallbackError.current = undefined
//   })

//   createEffect(() => {
//     function checkForUpdates() {
//       try {
//         const newSelectedState = latestSelector.current(context.getSlate())

//         if (equalityFn(newSelectedState, latestSelectedState.current)) {
//           return
//         }

//         latestSelectedState.current = newSelectedState
//       } catch (err) {
//         // we ignore all errors here, since when the component
//         // is re-rendered, the selectors are called again, and
//         // will throw again, if neither props nor store state
//         // changed
//         if (err instanceof Error) {
//           latestSubscriptionCallbackError.current = err
//         } else {
//           latestSubscriptionCallbackError.current = new Error(String(err))
//         }
//       }

//       forceRender()
//     }

//     const unsubscribe = context.addEventListener(checkForUpdates)

//     checkForUpdates()

//     return () => unsubscribe()
//   })

//   return selectedState
// }
