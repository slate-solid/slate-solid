import { DOMEditor, type DOMEditorInterface } from 'slate-dom'

export interface SolidEditor extends DOMEditor {}

export interface SolidEditorInterface extends DOMEditorInterface {}

export const SolidEditor: SolidEditorInterface = DOMEditor
