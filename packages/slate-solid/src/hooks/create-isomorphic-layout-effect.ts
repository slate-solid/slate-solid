import { createEffect } from 'solid-js'

/*
 * Temporarily modeling this after slate-react `use-isomorphic-layout-effect`
 * until we can determine if / when something comparable is needed in SolidJS.
 * This will at least make it easier to identify places that used the slate-react
 * version.
 */
export const createIsomorphicLayoutEffect = createEffect
