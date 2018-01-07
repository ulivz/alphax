import * as vinyl from 'vinyl-fs'
import * as File from 'vinyl'
import * as es from 'event-stream'
import { isString, isFunction, isArray, isUndefined, isPromise } from './utils'
import ReadWriteStream = NodeJS.ReadWriteStream;

type Glob = string | string[]

interface Options extends vinyl.SrcOptions {
  transformer?: (file: File) => void
}

export default async function dest(source: Glob,
                                   target: string,
                                   options?: Options = {}): Promise<ReadWriteStream> {

  console.log(source)

  if (!isString(source) && !isArray(source)) {
    throw new Error('Expected "source" to be string or array.')
  }
  if (!isString(target)) {
    throw new Error('Expected "target" to be string.')
  }

  const globs = source
  const stream: ReadWriteStream = vinyl.src(globs, options)
  const { transformer } = options

  if (!isUndefined(transformer) && !isFunction(transformer)) {
    stream.emit('unexpected-transformer')
  }

  const transform = (file: File, cb) => {
    let transformRes
    if (transformer) {
      try {
        transformRes = transformer(file)
      } catch (error) {
        stream.emit('transform-error', error)
      }
    }

    if (isPromise(transformRes)) {
      return transformRes.then(() => {
        cb(null, file)
      })
    }

    cb(null, file)
  }

  stream
    .pipe(es.map(transform))
    .pipe(vinyl.dest(target))

  await new Promise((resolve, reject) => {
    stream.on('end', () => resolve(stream))
    stream.on('error', reject)
  })
}
