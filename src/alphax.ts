import path from 'path'
import fs from 'fs-extra'
import * as File from 'vinyl'
import { EventEmitter } from 'events'
import ware from 'ware'
import dest from './dest'
import { isArray, isFunction, isPromise } from "./utils"

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
  public baseDir: string
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
    baseDir = '.'
  } = {}) {
    this.baseDir = baseDir
    this.patterns = isArray(patterns) ? patterns : [patterns]
    this.dotFiles = dotFiles
    this.renameConfig = rename
    this.filterConfig = filter
    this.transformFn = transformFn
    return this
  }

  async transformer(file: File) {
    // 1. middleware
    try {
      await new Promise((resolve, reject) => {
        ware().use(this.middlewares).run(file, (err: Error) => {
          if (err) return reject(err)
          resolve()
        })
      })
    } catch (error) {
      console.log(error)
    }

    // 2. transform
    if (!file.isDirectory()) {
      let contents: string = (<Buffer>file.contents).toString()
      let transformRes: Promise | string;
      if (isFunction(this.transformFn)) {
        try {
          transformRes = this.transformFn(contents)
          if (isPromise(transformRes)) {
            transformRes = await transformRes
          }
        } catch (err) {
          console.error('Failed to transform file: ' + file.relative)
        }
      }
      file.contents = Buffer.from(transformRes || contents)
    }
  }

  public use(middleware: Middleware) {
    this.middlewares.push(middleware)
    return this
  }

  public async dest(destPath: string, {
    clean = false
  } = {}) {
    if (!destPath) {
      throw new Error('dest path is required')
    }
    // destPath = path.resolve(this.base, destPath)
    console.log(destPath)

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
          this.patterns.push('!' + path.join(this.baseDir, fileName))
        }
      })
    }

    const stream = dest(
      this.patterns,
      destPath,
      {
        allowEmpty: true,
        transformer: this.transformer.bind(this)
      }
    )

    return new Promise((resolve, reject) => {
      stream.on('end', resolve)
      stream.on('error', reject)
    })
  }
}

export default () => new AlphaX()
