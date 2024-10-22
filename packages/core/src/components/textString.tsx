import { createEffect, createSignal, mergeProps } from 'solid-js'

/**
 * Leaf strings with text in them.
 */
export const TextString = (origProps: {
  text: string
  isTrailing?: boolean
}) => {
  const props = mergeProps({ isTrailing: false }, origProps)

  const getTextContent = () => {
    return `${props.text ?? ''}${props.isTrailing ? '\n' : ''}`
  }

  // TODO: A lot of this code doesn't seem applicable to SolidJS, but TBD
  // const [initialText] = createSignal(getTextContent())

  // This is the actual text rendering boundary where we interface with the DOM
  // The text is not rendered as part of the virtual DOM, as since we handle basic character insertions natively,
  // updating the DOM is not a one way dataflow anymore. What we need here is not reconciliation and diffing
  // with previous version of the virtual DOM, but rather diffing with the actual DOM element, and replace the DOM <span> content
  // exactly if and only if its current content does not match our current virtual DOM.
  // Otherwise the DOM TextNode would always be replaced by React as the user types, which interferes with native text features,
  // eg makes native spellcheck opt out from checking the text node.

  // useLayoutEffect: updating our span before browser paint
  // useIsomorphicLayoutEffect(() => {
  //   // null coalescing text to make sure we're not outputing "null" as a string in the extreme case it is nullish at runtime
  //   const textWithTrailing = getTextContent()

  //   if (ref.current && ref.current.textContent !== textWithTrailing) {
  //     ref.current.textContent = textWithTrailing
  //   }

  //   // intentionally not specifying dependencies, so that this effect runs on every render
  //   // as this effectively replaces "specifying the text in the virtual DOM under the <span> below" on each render
  // })

  // We intentionally render a memoized <span> that only receives the initial text content when the component is mounted.
  // We defer to the layout effect above to update the `textContent` of the span element when needed.
  // return <MemoizedText ref={ref}>{initialText}</MemoizedText>

  // let ref!: HTMLSpanElement

  // createEffect(() => {
  //   if (ref == null) {
  //     return
  //   }

  //   const textWithTrailing = getTextContent()
  //   if (ref.textContent !== textWithTrailing) {
  //     ref.textContent = textWithTrailing
  //   }
  // })

  // return (
  //   <span ref={ref} data-slate-string>
  //     {initialText()}
  //   </span>
  // )
  return <span data-slate-string>{getTextContent()}</span>
}

// const MemoizedText = memo(
//   forwardRef<HTMLSpanElement, { children: string }>((props, ref) => {
//     return (
//       <span data-slate-string ref={ref}>
//         {props.children}
//       </span>
//     )
//   }),
// )
