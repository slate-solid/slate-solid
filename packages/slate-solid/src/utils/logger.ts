export class Logger {
  constructor(label: string) {
    this._label = label
  }

  private _label: string

  debug = (...args: any[]) => {
    console.debug(`[${this._label}]`, ...args)
  }
}
