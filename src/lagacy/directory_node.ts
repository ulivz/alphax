import fs from 'fs-extra'
import path from 'path'
import AbstractFileNode from './abstract_node'
import { IJsonTreeNode } from './abstract_node'
import FileNode from './file_node'
import globby from 'globby'
import { isString, isArray, isPlainObject, isFunction, isUndefined } from './utils'

type Node = DirectoryNode | FileNode

interface DestOptions {
  write?: boolean
  newDir?: boolean
  _isRoot?: boolean
}


/**
 * Get childnode instance by childNode's Name and parentNode
 * @param childNodeName
 * @param parentNode
 */
function getChildNode(childNodeName: string, parentNode: Node) {
  let childNodePath: string = path.resolve(parentNode.path, childNodeName)
  let stats = fs.statSync(childNodePath)
  let ChildNodeConstructor = stats.isDirectory()
    ? DirectoryNode
    : FileNode

  return new ChildNodeConstructor(childNodePath, parentNode.cwd)
}

/**
 * Main
 */
class DirectoryNode extends AbstractFileNode {

  public nodes: Array<Node>

  constructor(path, cwd) {
    if (!cwd) {
      cwd = path
    }
    super(path, cwd)
    this.isDirectory = true
    this.nodes = []
  }

  /**
   * Recursive traverse
   */
  async traverse() {
    const nodeNames = fs.readdirSync(this.path)
    this.nodes = nodeNames
      .map(nodeName => getChildNode(nodeName, this))

    await Promise.all(this.nodes
      .map((childNode: DirectoryNode) => childNode.traverse()))
  }

  transform(fn: (node: DirectoryNode) => Object | string): IJsonTreeNode {
    let result = fn(this)
    if (typeof result === 'object') {
      return {
        ...result,
        nodes: this.nodes.map((childNode) => childNode.transform(fn))
      }
    }
    return {
      [result]: this.nodes.map(childNode => childNode.transform(fn))
    }
  }

  async _processGlob(glob) {
    if (isArray(glob) || isString(glob)) {
      let files: string[] = await globby(glob, {
        cwd: this.cwd
      })

      // console.log(files)
	  //
      // let tokens = new Set(files)
      // for (let item of files.map(i => i.split('/'))) {
      //   item.pop()
      //   while (item.length) {
      //     tokens.add(item.join('/'))
      //     item.pop()
      //   }
      // }
      // let tokenList = [...tokens]

      console.log(files)
      const filterFn = node => files.indexOf(node.relative) > -1
      this.filter(filterFn)
    } else {
      console.log(`Expect glob to be string or array, received ${typeof glob}`)
    }
  }

  async _processRename(rename) {
    let nodes = this.flatten()
    let keys = Object.keys(rename)
    nodes.forEach(node => {
      keys.forEach(key => {
        const oldname = node.relative
        if (oldname.indexOf(key) !== -1) {
          node.rename(oldname.replace(key, rename[key]))
        }
      })
    })
  }

  async process({ glob, rename } = {}) {
    await this.traverse()
    if (glob) {
      await this._processGlob(glob)
    }
    if (rename) {
      await this._processRename(rename)
    }
    return this.destFiles()
  }

  /**
   * Get json object
   */
  toJSON() {
    return this.transform(node => node._toJSON())
  }

  flatten(fn?: (Node) => any) {
    let list: Array<Node> = []
    this.nodes
      .forEach(childNode => {
        list.push(childNode)
        if (childNode.isDirectory) {
          list.push(...(<DirectoryNode>childNode).flatten())
        }
      })
    if (fn) {
      return list.map(fn)
    }
    return list
  }

  filter(handler) {
    this.nodes = this.nodes.filter(childNode => {
      console.log(childNode.label, handler(childNode))
      if (handler(childNode)) {
        return true
      }
      if (childNode.isDirectory) {
        (<DirectoryNode>childNode).filter(handler)
      }
      console.log('filtered: ' + childNode.relative)
      return false
    })
  }

  setpath(newpath) {
    this.path = newpath
    this.nodes.forEach(node => {
      const childNewpath = path.join(this.path, node.basename)
      node.setpath(childNewpath)
    })
  }

  dest(destDir: string, opts: DestOptions = {}) {
    if (typeof opts._isRoot === 'undefined') {
      opts._isRoot = true
    }
    const { _isRoot, newDir, write } = opts

    fs.ensureDirSync(destDir)
    if (newDir) {
      destDir = path.join(destDir, this.basename)
    }

    let tasks = []

    for (let childNode of this.nodes) {
      const { isDirectory, relative, originalPath } = childNode
      const childopts = {
        write: opts.write,
        newDir: opts.newDir,
        _isRoot: false
      }

      if (!write) {
        if (isDirectory) {
          tasks.push((<DirectoryNode>childNode).dest(destDir, childopts))
        }
        continue
      }

      if (isDirectory) {
        tasks.push(
          fs.ensureDir(path.join(destDir, relative))
            .then(() => (<DirectoryNode>childNode).dest(destDir, childopts))
        )
      } else {
        if (write) {
          tasks.push(
            fs.copy(originalPath, path.join(destDir, relative))
          )
        }
      }
    }

    return Promise.all(tasks)
      .then(() => _isRoot ? this.destFiles() : void 0)
  }

  destFiles() {
    return this.flatten()
      .map(node => node._toJSON())
  }

  _basicSearch(type, keyword) {
    if (!keyword || !this.nodes.length) {
      return null
    }

    let stack = []
    for (let i = 0, l = this.nodes.length; i < l; i++) {
      let node = this.nodes[i]
      stack.push(node)
    }

    while (stack.length) {
      let node = stack.shift()
      if (node[type] === keyword) {
        return node
      }
      if (node.nodes) {
        for (let i = 0, l = node.nodes.length; i < l; i++) {
          stack.push(node.nodes[i])
        }
      }
    }

    return null
  }

  findByPath(path) {
    return this._basicSearch('path', path)
  }

  findByRelative(relative) {
    return this._basicSearch('relative', relative)
  }

  findByBasename(keyword) {
    return this._basicSearch('basename', keyword)
  }

}


export default (...args) => new DirectoryNode(...args)
