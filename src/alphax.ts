import path from 'path'
import { EventEmitter } from 'events'
import ware from 'ware'
import * as File from 'vinyl'
import * as vinyl from 'vinyl-fs'
import ReadWriteStream = NodeJS.ReadWriteStream;
import WritableStream = NodeJS.WritableStream;
import { isArray, isFunction, isPromise, curryFileTransformer, isBuffer } from "./utils"
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
    if (isBuffer(this.files[relative].contents)) {
      return (this.files[relative].contents as Buffer).toString()
    }
    return null
  }

  public fileMap() {
    const fileOb = {}
    Object.keys(this.files).forEach(relative => fileOb[relative] = this.fileContent(relative))
    return fileOb
  }

  public fileList() {
    const list: string[] = []
    Object.keys(this.files).forEach(file => list.push(file))
    return list
  }

  public async dest(destPath: string, {
    write = true
  } = {}) {

    if (!destPath) {
      write = false
    }

    if (write && !destPath) {
      throw new Error('Expect dest path when writeable')
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
      allowEmpty: true,
      cwd: this.baseDir
    })

    const transform = curryFileTransformer((file: File) => {
      return this.transformer(file)
    })

    const collect = curryFileTransformer((file: File) => {
      const { relative } = file
      // Filter root file.
      if (relative) {
        this.files[relative] = file
      }
    })

    const filter = curryFileTransformer((file: File) => {
      const filtered = this.filters.some(_filter => !_filter(file))
      if (filtered) {
        return null
      }
    })

    let filterStream = es.map(filter)
    let transformStream = es.map(transform)
    let collectStream = es.map(collect)

    if (write) {
      let destStream = vinyl.dest(destPath, { cwd: this.baseDir || process.cwd() })
      stream
        .pipe(filterStream)
        .pipe(transformStream)
        .pipe(destStream)
        .pipe(collectStream)

    } else {
      stream
        .pipe(filterStream)
        .pipe(transformStream)
        .pipe(collectStream)
    }

    return new Promise((resolve, reject) => {
      collectStream
        .on('end', () => resolve(this.files))
        .on('error', reject)
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
      this.emit('middleware-error', error)
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
          this.emit('transform-error', err, file)
        }
      }
      file.contents = Buffer.from(transformRes || contents)
    }
  }
}

export default () => new AlphaX()
