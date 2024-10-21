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
}

export type RoutePath = keyof typeof routeMap

export const routes = [
  ...Object.entries(routeMap).map(([path, value]) => ({
    path,
    ...value,
  })),
  redirectToDefaultRoute,
]
