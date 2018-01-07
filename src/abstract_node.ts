import * as path from 'path'

const DEFAULT_JSON_FIELDS = [
  'relative',
  'basename',
]

export interface INode<T> {
  path?: string
  cwd?: string
  relative?: string
  nodes?: T[]
  contents?: Buffer
}

export interface IAbstractFileNode extends INode<IAbstractFileNode> {
  isDirectory?: string
  isFile?: string
  history?: string
  originalPath?: string
  originalRelative?: string
  basename?: string
  label?: string
  stem?: string
  extname?: string
}

export interface IJsonTreeNode {
  [key: string]: any
  nodes?: any[]
}

abstract class AbstractFileNode implements IAbstractFileNode {

  protected abstract setpath(newpath: string): void

  // protected abstract transform(transformFn: (node: AbstractFileNode) => Object | string): IJsonTreeNode

  public isDirectory: boolean
  public isFile: boolean
  public cwd: string
  public history: string[]

  constructor(opath: string, cwd: string = process.cwd()) {
    this.cwd = cwd
    this.history = [opath]
  }

  public get path() {
    return this.history[this.history.length - 1]
  }

  public set path(newpath) {
    this.history.push(newpath)
  }

  public get originalPath() {
    return this.history[0]
  }

  public get originalRelative() {
    return path.relative(this.cwd, this.originalPath)
  }

  public get relative() {
    return path.relative(this.cwd, this.path)
  }

  public get basename() {
    return this.path.split('/').pop()
  }

  public get label() {
    return this.basename
  }

  public get stem() {
    return this.basename.split('.')[0]
  }

  public get extname() {
    return this.basename.split('.')[1]
  }

  public rename(newname) {
    let newpath = path.join(
      this.path.slice(0, this.path.lastIndexOf('/')),
      newname
    )
    this.setpath(newpath)
  }

  public _toJSON(fiels?: string[]): IAbstractFileNode {
    const fields = {};
    fiels = fiels || DEFAULT_JSON_FIELDS
    fiels
      .forEach(field => {
        if (typeof this[field] !== 'undefined') {
          fields[field] = this[field]
        }
      });
    return fields
  }
}

export default AbstractFileNode
