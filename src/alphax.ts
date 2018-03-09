import path from 'path'
import { EventEmitter } from 'events'
import ware from 'ware'
import * as es from 'event-stream'
import * as File from 'vinyl'
import { src, dest, SrcOptions } from 'vinyl-fs'
import { isArray, isFunction, isPromise, curryFileTransformer, isBuffer, getRenamerByConfig } from './utils'
import { getRenameMiddleware } from './middlewares'

export type Middleware = (file: File) => any
export type Glob = string[] | string
export type TransformFn = (contents: string, file: File) => Promise<string> | string
export type Task = (app: typeof AlphaX) => Promise<void> | void
export type Filter = (file: File) => boolean

/**
 * A Renamer that accepts an old path (It's actually a relative path),
 * and returns the value as a new path
 */
export type Renamer = (filepath: string) => string

export interface Files {
  [relative: string]: File
}

export interface RenameConfig {
  [oldname: string]: string
}

export interface filtersConfig {
  [pattern: string]: boolean
}

export interface Changelog {
  [relative: string]: string[]
}

export interface AlphaXSrcOptions extends SrcOptions {
  baseDir?: string;
  rename?: RenameConfig;
  filters?: filtersConfig;
  transformFn?: TransformFn;
}

export class AlphaX extends EventEmitter {
  private middlewares: Middleware[]
  private tasks: Task[]
  private patterns: string[]
  private renameConfig: RenameConfig
  private filtersConfig: filtersConfig
  private options: SrcOptions
  private filters: Array<Filter>
  private renamers: Array<Renamer>
  private renameChangelog: Changelog
  public meta: any
  public baseDir: string
  public transformFn: TransformFn
  public files: Files

  constructor() {
    super()
    this.middlewares = []
    this.meta = {}
    this.files = {}
    this.filters = []
    this.tasks = []
    this.renamers = []
    this.renameChangelog = {}
  }

  public src(patterns: Glob, {
    baseDir = '.',
    rename = {},
    filters = {},
    transformFn,
    ...options
  }: AlphaXSrcOptions = {}) {
    this.baseDir = baseDir
    this.patterns = isArray(patterns) ? patterns : [patterns]
    this.renameConfig = rename
    this.filtersConfig = filters
    this.transformFn = transformFn
    this.options = options
    options.cwd = options.cwd || baseDir
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

  public filter(filter: Filter) {
    this.filters.push(filter)
    return this
  }

  public rename(renamer: Renamer) {
    this.renamers.push(renamer)
    return this
  }

  public async dest(destPath: string, {
    write = true,
    ...options
  } = {}) {

    if (!destPath) {
      write = false
    }

    if (write && !destPath) {
      throw new Error(
        'Expect first parameter to be dest path when writeable.'
      )
    }

    // If there is rename config, convert it to a renamer function
    if (this.renameConfig) {
      this.renamers.push(getRenamerByConfig(this.renameConfig))
    }
    // Use rename middleware
    this.use(getRenameMiddleware(this.renamers, this.renameChangelog))

    if (this.filtersConfig) {
      Object.keys(this.filtersConfig).forEach(fileName => {
        if (!this.filtersConfig[fileName]) {
          this.patterns.push('!' + path.join(this.baseDir, fileName))
        }
      })
    }

    const stream: NodeJS.ReadWriteStream = src(this.patterns, this.options)

    const transform = curryFileTransformer((file: File) => this.transformFile(file))

    const filter = curryFileTransformer((file: File) =>
      this.filters.some(_filter => !_filter(file)) ? null : true)

    const collect = curryFileTransformer((file: File) => {
      const { relative } = file
      if (relative) { // Filter root file.
        this.files[relative] = file
      }
    })

    const filterStream = es.map(filter)
    const transformStream = es.map(transform)
    const collectStream = es.map(collect)

    if (write) {
      let destStream = dest(destPath, options || {})
      stream.pipe(filterStream).pipe(transformStream).pipe(destStream).pipe(collectStream)
    } else {
      stream.pipe(filterStream).pipe(transformStream).pipe(collectStream)
    }

    return new Promise((resolve, reject) => {
      collectStream
        .on('end', () => resolve(this.files))
        .on('error', reject)
    })
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

  private async transformFile(file: File) {
    // 1. middleware
    try {
      await new Promise((resolve) => {
        ware().use(this.middlewares).run(file, (err: Error) => {
          if (err) {
            console.log(err)
          } else {
            resolve()
          }
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
