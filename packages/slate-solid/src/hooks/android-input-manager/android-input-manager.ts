import { Point } from 'slate'

// TODO: This module has a lot more code in `slate-react`.
// For now just need the `Action` type.
export type Action = { at?: Point | Range; run: () => void }
