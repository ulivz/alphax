import path from 'path'
import { EventEmitter } from 'events'
import fs from 'fs-extra'
import ware from 'ware'
import * as File from 'vinyl'
import * as vinyl from 'vinyl-fs'
import ReadWriteStream = NodeJS.ReadWriteStream;
import WritableStream = NodeJS.WritableStream;
import { isArray, isFunction, isPromise, curryFileTransformer } from "./utils"
import * as es from 'event-stream'

type Middleware = (file: File) => any
type Glob = string[] | string
type TransformFn = (contents: string, file: File) => Promise<string> | string
type Task = (app: typeof AlphaX) => Promise<void> | void
type Filter = (file: File) => boolean

interface Files {
  [relative: string]: File
}

interface RenameConfig {
  [oldname: string]: string
}

interface filterConfig {
  [pattern: string]: boolean
}

export class AlphaX extends EventEmitter {
  private middlewares: Middleware[]
  private tasks: Task[]
  private patterns: string[]
  private renameConfig: RenameConfig
  private filterConfig: filterConfig
  private dotFiles: boolean
  private options: vinyl.SrcOptions
  public meta: any
  public baseDir: string
  public transformFn: TransformFn
  public files: Files
  public filters: Array<Filter>

  constructor() {
    super()
    this.middlewares = []
    this.meta = {}
  }

  public src(patterns: Glob, {
    rename = {},
    filter = {},
    transformFn,
    dotFiles = true,
    baseDir = '.',
    options = ''
  } = {}) {
    this.baseDir = baseDir
    this.patterns = isArray(patterns) ? patterns : [patterns]
    this.options = options
    this.dotFiles = dotFiles
    this.renameConfig = rename
    this.filterConfig = filter
    this.transformFn = transformFn
    this.files = {}
    this.filters = []
    return this
  }

  public task(task: Task) {
    this.tasks.push(task)
    return this
  }

  public use(middleware: Middleware) {
    this.middlewares.push(middleware)
    return this
  }

  public filter(fn) {
    this.filters.push(fn)
    return this
  }

  public fileContent(relative: string) {
    return (this.files[relative].contents as Buffer).toString()
  }

  public async dest(destPath: string, {
    write = true,
    clean = false
  } = {}) {
    if (!destPath) {
      throw new Error('dest path is required')
    }
    // destPath = path.resolve(this.base, destPath)

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

    const stream: ReadWriteStream = vinyl.src(this.patterns, {
      allowEmpty: true
    })

    const transform = curryFileTransformer((file: File) => {
      console.log('transform: ' + file.relative)
      return this.transformer(file)
    })

    const collect = curryFileTransformer((file: File) => {
      console.log('collect: ' + file.relative)

      const { relative } = file
      // Filter root file.
      if (relative) {
        this.files[relative] = file
      }
    })

    const filter = curryFileTransformer((file: File) => {
      console.log('filter: ' + file.relative)

      const filtered = this.filters.some(_filter => !_filter(file))
      if (filtered) {
        return null
      }
    })

    let stream2
    let _resolve, _reject
    let filterStream = es.map(filter)
    let transformStream = es.map(transform)
    let collectStream = es.map(collect)

    collectStream
      .on('end', () => {
        _resolve(this.files)
      })
      .on('error', (error) => {
        _reject(error)
      })

    if (write) {
      let destStream = vinyl.dest(destPath)
      stream2 = stream
        .pipe(filterStream)
        .pipe(transformStream)
        .pipe(destStream)
        .pipe(collectStream)

    } else {
      stream2 = stream
        .pipe(filterStream)
        .pipe(transformStream)
        .pipe(collectStream)
    }

    return new Promise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })
  }

  private async transformer(file: File) {
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
          transformRes = this.transformFn(contents, file)
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
}

export default () => new AlphaX()
