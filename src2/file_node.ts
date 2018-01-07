import fs from 'fs-extra'
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

  async traverse() {
    this.contents = await fs.readFile(this.path)
  }

  toJSON() {
    return this._toJSON()
  }

  setpath(newpath) {
    this.path = newpath
  }


}
