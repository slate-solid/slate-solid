export class Logger {
  constructor(label: string) {
    this._label = `[${label}]`
  }

  private _label: string

  debug = (...args: any[]) => {
    console.debug(this._label, ...args)
  }

  group = (...label: any[]) => {
    console.group(this._label, ...label)
  }

  groupCollapsed = (...label: any[]) => {
    console.groupCollapsed(this._label, ...label)
  }

  groupEnd = () => {
    console.groupEnd()
  }
}
