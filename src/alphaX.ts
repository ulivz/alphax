import path from 'path'
import fs from 'fs-extra'
import * as File from 'vinyl'
import { EventEmitter } from 'events'
import ware from 'ware'
import dest from './dest'
import { isArray, isPromise } from "./utils"

type Middleware = (ctx: File) => any
type Glob = string[] | string
type TransformFn = (contents: string) => Promise<string> | string

interface RenameConfig {
  [oldname: string]: string
}

interface filterConfig {
  [pattern: string]: boolean
}

class AlphaX extends EventEmitter {
  private middlewares: Middleware[]
  private patterns: string[]
  private renameConfig: RenameConfig
  private filterConfig: filterConfig
  private dotFiles: boolean
  public meta: any
  public base: string
  public transformFn: TransformFn

  constructor() {
    super()
    this.middlewares = []
    this.meta = {}
  }

  src(patterns: Glob, {
    rename = {},
    filter = {},
    transformFn,
    dotFiles = true,
  } = {}) {
    this.patterns = isArray(patterns) ? patterns : [patterns]
    this.dotFiles = dotFiles
    this.renameConfig = rename
    this.filterConfig = filter
    this.transformFn = transformFn
    return this
  }

  async transformer(file: File) {
    // 1. middleware
    await new Promise((resolve, reject) => {
      ware().use(this.middlewares).run(file, (err: Error) => {
        if (err) return reject(err)
        resolve()
      })
    })

    // 3. transform
    if (!file.isDirectory()) {
      const contents = (<Buffer>file.contents).toString()
      let result = this.transformFn(contents)
      if (isPromise(result)) {
        result = await result
      }
      file.contents = Buffer.from(result)
    }
  }

  public use(middleware: Middleware) {
    this.middlewares.push(middleware)
    return this
  }

  public async dest(destPath: string, {
    base = '.',
    clean = false
  } = {}) {
    this.base = base
    destPath = path.resolve(this.base, destPath)

    if (clean) {
      await fs.remove(destPath)
    }

    // Add rename middleware.
    if (this.renameConfig) {
      const getNewName = (name: string): string => {
        Object.keys(this.renameConfig).forEach(pattern => {
          name = name.replace(pattern, this.renameConfig[pattern])
        })
        return name
      }
      this.use((file) => {
        let oldRelative = file.relative
        let newName = path.join(file.base, getNewName(file.relative))
        if (file.path !== newName) {
          file.path = newName
          this.emit('rename', {
            oldname: oldRelative,
            newname: file.relative
          })
        }
      })
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
        base,
        allowEmpty: true,
        transformer: this.transformer.bind(this)
      }
    )
  }
}

export default () => new AlphaX()
