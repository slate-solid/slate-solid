import {
  createEffect,
  createMemo,
  createSignal,
  JSX,
  mergeProps,
} from 'solid-js'
import { Element, Text } from 'slate'
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer'
import String from './string'
import { PLACEHOLDER_SYMBOL, EDITOR_TO_PLACEHOLDER_ELEMENT } from 'slate-dom'
import { RenderLeafProps, RenderPlaceholderProps } from './propTypes'
import { useSlateStatic } from '../hooks/useSlateStatic'
import { IS_WEBKIT, IS_ANDROID } from 'slate-dom'
import { useRef, type MutableRefObject } from '../hooks/useRef'
import { DefaultLeaf } from './defaultLeaf'

// Delay the placeholder on Android to prevent the keyboard from closing.
// (https://github.com/ianstormtaylor/slate/pull/5368)
const PLACEHOLDER_DELAY = IS_ANDROID ? 300 : 0

function disconnectPlaceholderResizeObserver(
  placeholderResizeObserver: MutableRefObject<ResizeObserver | null>,
  releaseObserver: boolean,
) {
  if (placeholderResizeObserver.current) {
    placeholderResizeObserver.current.disconnect()
    if (releaseObserver) {
      placeholderResizeObserver.current = null
    }
  }
}

type TimerId = ReturnType<typeof setTimeout> | null

function clearTimeoutRef(timeoutRef: MutableRefObject<TimerId>) {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }
}

export interface LeafProps {
  isLast: boolean
  leaf: Text
  parent: Element
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
  renderLeaf?: (props: RenderLeafProps) => JSX.Element
  text: Text
}

/**
 * Individual leaves in a text node with unique formatting.
 */
const Leaf = (origProps: LeafProps) => {
  const props = mergeProps(
    { renderLeaf: (props: RenderLeafProps) => <DefaultLeaf {...props} /> },
    origProps,
  )

  const editor = useSlateStatic()
  const placeholderResizeObserver = useRef<ResizeObserver | null>(null)
  const placeholderRef = useRef<HTMLElement | null>(null)
  const [showPlaceholder, setShowPlaceholder] = createSignal(false)
  const showPlaceholderTimeoutRef = useRef<TimerId>(null)

  const callbackPlaceholderRef = (placeholderEl: HTMLElement | null) => {
    disconnectPlaceholderResizeObserver(
      placeholderResizeObserver,
      placeholderEl == null,
    )

    if (placeholderEl == null) {
      EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor())
      props.leaf.onPlaceholderResize?.(null)
    } else {
      EDITOR_TO_PLACEHOLDER_ELEMENT.set(editor(), placeholderEl)

      if (!placeholderResizeObserver.current) {
        // Create a new observer and observe the placeholder element.
        const ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill
        placeholderResizeObserver.current = new ResizeObserver(() => {
          props.leaf.onPlaceholderResize?.(placeholderEl)
        })
      }
      placeholderResizeObserver.current.observe(placeholderEl)
      placeholderRef.current = placeholderEl
    }
  }

  const leafIsPlaceholder = () => Boolean(props.leaf[PLACEHOLDER_SYMBOL])
  createEffect(() => {
    if (leafIsPlaceholder()) {
      if (!showPlaceholderTimeoutRef.current) {
        // Delay the placeholder, so it will not render in a selection
        showPlaceholderTimeoutRef.current = setTimeout(() => {
          setShowPlaceholder(true)
          showPlaceholderTimeoutRef.current = null
        }, PLACEHOLDER_DELAY)
      }
    } else {
      clearTimeoutRef(showPlaceholderTimeoutRef)
      setShowPlaceholder(false)
    }
    return () => clearTimeoutRef(showPlaceholderTimeoutRef)
  })

  const children = createMemo(() => {
    let children = (
      <String
        isLast={props.isLast}
        leaf={props.leaf}
        parent={props.parent}
        text={props.text}
      />
    )

    if (leafIsPlaceholder() && showPlaceholder()) {
      const placeholderProps: RenderPlaceholderProps = {
        children: props.leaf.placeholder,
        attributes: {
          'data-slate-placeholder': true,
          style: {
            position: 'absolute',
            top: 0,
            'pointer-events': 'none',
            width: '100%',
            'max-width': '100%',
            display: 'block',
            opacity: '0.333',
            'user-select': 'none',
            'text-decoration': 'none',
            // Fixes https://github.com/udecode/plate/issues/2315
            '-webkit-user-modify': IS_WEBKIT ? 'inherit' : undefined,
          },
          contentEditable: false,
          ref: callbackPlaceholderRef,
        },
      }

      children = (
        <>
          {props.renderPlaceholder(placeholderProps)}
          {children}
        </>
      )
    }

    return children
  })

  // COMPAT: Having the `data-` attributes on these leaf elements ensures that
  // in certain misbehaving browsers they aren't weirdly cloned/destroyed by
  // contenteditable behaviors. (2019/05/08)
  const attributes: {
    'data-slate-leaf': true
  } = {
    'data-slate-leaf': true,
  }

  return (
    <>
      {props.renderLeaf({
        attributes,
        children: children(),
        leaf: props.leaf,
        text: props.text,
      })}
    </>
  )
}

// TODO: Figure out if there is something comparable that needs to be done for SolidJS
// const MemoizedLeaf = React.memo(Leaf, (prev, next) => {
//   return (
//     next.parent === prev.parent &&
//     next.isLast === prev.isLast &&
//     next.renderLeaf === prev.renderLeaf &&
//     next.renderPlaceholder === prev.renderPlaceholder &&
//     next.text === prev.text &&
//     Text.equals(next.leaf, prev.leaf) &&
//     next.leaf[PLACEHOLDER_SYMBOL] === prev.leaf[PLACEHOLDER_SYMBOL]
//   )
// })

// export default MemoizedLeaf

export default Leaf
