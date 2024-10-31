import { useNavigate } from '@solidjs/router'
import { lazy } from 'solid-js'

function RedirectToDefault() {
  const navigate = useNavigate()
  navigate('/rich-text')
  return null
}

const redirectToDefaultRoute = {
  path: '/*404',
  component: RedirectToDefault,
}

export const routeMap = {
  '/debug-rendering': {
    label: 'Debug Rendering',
    component: lazy(() => import('./_debugRendering')),
    src: 'src/examples/_debugRendering.tsx',
  },
  '/check-lists': {
    label: 'Checklists',
    component: lazy(() => import('./checkLists')),
    src: 'src/examples/checkLists.tsx',
  },
  '/code-highlighting': {
    label: 'Code Highlighting',
    component: lazy(() => import('./codeHighlighting')),
    src: 'src/examples/codeHighlighting.tsx',
  },
  '/custom-placeholder': {
    label: 'Custom Placeholder',
    component: lazy(() => import('./customPlaceholder')),
    src: 'src/examples/customPlaceholder.tsx',
  },
  '/editable-voids': {
    label: 'Editable Voids',
    component: lazy(() => import('./editableVoids')),
    src: 'src/examples/editableVoids.tsx',
  },
  '/embeds': {
    label: 'Embeds',
    component: lazy(() => import('./embeds')),
    src: 'src/examples/embeds.tsx',
  },
  '/hovering-toolbar': {
    label: 'Hovering Toolbar',
    component: lazy(() => import('./hoveringToolbar')),
    src: 'src/examples/hoveringToolbar.tsx',
  },
  '/huge-document': {
    label: 'Huge Document',
    component: lazy(() => import('./hugeDocument')),
    src: 'src/examples/hugeDocument.tsx',
  },
  '/read-only': {
    label: 'Read-only',
    component: lazy(() => import('./readOnly')),
    src: 'src/examples/readOnly.tsx',
  },
  '/rich-text': {
    label: 'Rich Text',
    component: lazy(() => import('./richText')),
    src: 'src/examples/richText.tsx',
  },
  '/styling': {
    label: 'Styling',
    component: lazy(() => import('./styling')),
    src: 'src/examples/styling.tsx',
  },
  '/plaintext': {
    label: 'Plain Text',
    component: lazy(() => import('./plaintext')),
    src: 'src/examples/plaintext.tsx',
  },
}

export type RoutePath = keyof typeof routeMap

export const routes = [
  ...Object.entries(routeMap).map(([path, value]) => ({
    path,
    ...value,
  })),
  redirectToDefaultRoute,
]
