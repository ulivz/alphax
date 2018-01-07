import path from 'path'
import fs from 'fs-extra'
import { EventEmitter } from 'events'
import ware from 'ware'
import dest from './dest'
import { isArray, isPromise } from "./utils"

type Middleware = (ctx: AlphaX) => any
type Glob = string[]
type TransformFn = (contents: string) => Promise<string> | string

interface RenameConfig {
  [oldname: string]: string
}

interface filterConfig {
  [pattern: string]: boolean
}

class AlphaX extends EventEmitter {
  private middlewares: Middleware[]
  private patterns: Glob
  private renameConfig: RenameConfig
  private filterConfig: filterConfig
  private dotFiles: boolean
  public meta: any
  public baseDir: string
  public transformFn: TransformFn

  constructor() {
    super()
    this.middlewares = []
    this.meta = {}
  }

  src(patterns: Glob, {
    baseDir = '.',
    rename = {},
    filter = {},
    transformFn,
    dotFiles = true,
  } = {}) {
    this.baseDir = path.resolve(baseDir)
    this.patterns = isArray(patterns) ? patterns : [patterns]
    this.dotFiles = dotFiles
    this.renameConfig = rename
    this.filterConfig = filter
    this.transformFn = transformFn
    return this
  }

  getNewName(name: string): string {
    Object.keys(this.renameConfig).forEach(pattern => {
      name = name.replace(pattern, this.renameConfig[pattern])
    })
    return name
  }

  async transformer(file) {
    // 1. middleware
    await new Promise((resolve, reject) => {
      ware().use(this.middlewares).run(file, this, (err: Error) => {
        if (err) return reject(err)
        resolve()
      })
    })

    // 2. rename
    let oldRelative = file.relative
    let newName = path.join(file.base, this.getNewName(file.relative))
    if (file.path !== newName) {
      file.path = newName
      this.emit('rename', {
        oldname: oldRelative,
        newname: file.relative
      })
    }

    // 3. transform
    if (!file.isDirectory()) {
      const contents = file.contents.toString()
      let result = this.transformFn(contents)
      if (isPromise(result)) {
        result = await result
      }
      file.contents = Buffer.from(result)
    }
  }

  use(middleware: Middleware) {
    this.middlewares.push(middleware)
    return this
  }

  async dest(destPath: string, {
    clean = false
  } = {}) {
    destPath = path.resolve(this.baseDir, destPath)

    if (clean) {
      await fs.remove(destPath)
    }

    if (this.filterConfig) {
      Object.keys(this.filterConfig).forEach(fileName => {
        if (!this.filterConfig[fileName]) {
          this.patterns.push('!./**/' + fileName)
        }
      })
    }

    await dest(
      this.patterns,
      destPath,
      {
        allowEmpty: true,
        transformer: this.transformer.bind(this)
      }
    )
  }
}

export default () => new AlphaX()
