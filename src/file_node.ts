import fs from 'fs'
import AbstractFileNode from './abstract_node'
import { IJsonTreeNode } from './abstract_node'

export default class FileNode extends AbstractFileNode {

  public isFile: boolean
  public contents: Buffer

  constructor(path, cwd) {
    super(path, cwd)
    this.isFile = true
  }

  transform(fn: (node: FileNode) => Object | string): IJsonTreeNode {
    return fn(this)
  }

  toJSON() {
    return this._toJSON()
  }

  get contents() {
    if (this.contents) {
      return this.contents
    }
    this.contents = fs.readFileSync(this.path)
    return this.contents
  }

  setpath(newpath) {
    this.path = newpath
  }


}
