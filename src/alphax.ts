import path from 'path'
import { EventEmitter } from 'events'
import * as es from 'event-stream'
import * as File from 'vinyl'
import match from 'minimatch'
import ware from 'ware'
import { src, dest, SrcOptions } from 'vinyl-fs'
import { isArray, isFunction, isPromise, isBuffer, curryFileTransformer, getRenamerByConfig, evaluate } from './utils'
import { getRenameMiddleware } from './middlewares'

export type Middleware = (file: File, meta: any) => any
export type Glob = string[] | string
export type TransformFn = (contents: string, file: File) => Promise<string> | string
export type Task = (app: AlphaX) => Promise<void> | void
export type Filter = (filepath: string) => boolean
export type Renamer = (filepath: string) => string

export interface Files {
  [relative: string]: File
}

export interface RenameConfig {
  [oldname: string]: string
}

export interface filtersConfig {
  [pattern: string]: boolean | string
}

export interface Changelog {
  [relative: string]: string[]
}

export interface AlphaXSrcOptions extends SrcOptions {
  baseDir?: string
  rename?: RenameConfig
  filters?: filtersConfig
  transformFn?: TransformFn
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
  public context: any

  constructor() {
    super()
    this.meta = {}
    this.files = {}
    this.filters = []
    this.renamers = []
    this.renameChangelog = {}
  }

  public src(patterns: Glob, {
    baseDir = '.',
    rename = {},
    filters = {},
    transform,
    tasks = [],
    use = [],
    context = {},
    ...options
  }: AlphaXSrcOptions = {}) {
    this.baseDir = baseDir
    this.patterns = isArray(patterns) ? patterns : [patterns]
    this.tasks = isArray(tasks) ? tasks : [tasks]
    this.middlewares = isArray(use) ? use : [use]
    this.renameConfig = rename
    this.filtersConfig = filters
    this.transformFn = transform
    this.options = options
    this.context = context
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

  public transform(transformFn: TransformFn) {
    this.transformFn = transformFn
    return this
  }

  public async dest(outDir: string, {
    write = true,
    baseDir = '.',
    ...options
  } = {}) {

    options.cwd = options.cwd || baseDir

    if (!outDir) {
      write = false
    } else {
      outDir = path.join(outDir, baseDir)
    }

    if (write && !outDir) {
      throw new Error(
        'Expect first parameter to be dest path when writeable.'
      )
    }

    // If there is rename config, convert it to a renamer function
    if (this.renameConfig) {
      this.renamers.push(getRenamerByConfig(this.renameConfig, this.combinedContext()))
    }
    // Use rename middleware
    this.use(getRenameMiddleware(this.renamers, this.renameChangelog))

    if (this.filtersConfig) {
      this.filters.push((filepath: string) => {
        for (const glob of Object.keys(this.filtersConfig)) {
          if (match(filepath, glob, { dot: true })) {
            const condition = this.filtersConfig[glob]
            if (!evaluate(condition, this.combinedContext())) {
              return null
            }
          }
        }
        return true
      })
    }

    try {
      await new Promise((resolve) => {
        ware().use(this.tasks).run(this, (err: Error) => {
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

    const stream: NodeJS.ReadWriteStream = src(this.patterns, this.options)

    const transform = curryFileTransformer((file: File) => this.transformFile(file))

    const filter = curryFileTransformer((file: File) => {
      if (file.isDirectory() || this.filters.some(_filter => !_filter(file.relative))) {
        return null
      }
      return true
    })

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
      let destStream = dest(outDir, options || {})
      stream.pipe(filterStream).pipe(transformStream).pipe(destStream).pipe(collectStream)
    } else {
      stream.pipe(filterStream).pipe(transformStream).pipe(collectStream)
    }

    return new Promise((resolve, reject) => {
      collectStream
        .on('end', () => resolve(this.fileMap()))
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

  private combinedContext() {
    return { ...this.meta, ...this.context }
  }

  private async transformFile(file: File) {

    file.originalRelative = file.relative

    // 1. middleware
    try {
      await new Promise((resolve) => {
        ware().use(this.middlewares).run(file, this.meta, (err: Error) => {
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
