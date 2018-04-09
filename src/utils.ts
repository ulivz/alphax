/**
 * data types check util
 * Modified from https://github.com/sindresorhus/is/blob/master/index.js
 */
import * as File from 'vinyl'
import { RenameConfig } from './alphax'

const toString = Object.prototype.toString
const getObjectType = x => toString.call(x).slice(8, -1)
const isOfType = type => x => typeof x === type // eslint-disable-line valid-typeof
const isObjectOfType = type => x => getObjectType(x) === type

export const isBoolean = x => x === true || x === false

export const isSymbol = isOfType('symbol')

export const isInteger = Number.isInteger

export const isSafeInteger = Number.isSafeInteger

export const isString = isOfType('string')

export const isUndefined = isOfType('undefined')

export const isNull = x => x === null

export const isNullOrUndefined = x => isUndefined(x) || isNull(x)

export const isFunction = isOfType('function')

export const isBuffer = Buffer.isBuffer

export const isGeneralizedObject = x => typeof x === 'object'

export const isPlainObject = isObjectOfType('Object')

export const isObject = x => !isNullOrUndefined(x) && (isFunction(x) || isGeneralizedObject(x))

const isValidLength = x => isSafeInteger(x) && x > -1;

export const isArray = Array.isArray

export const isArrayLike = x => !isNullOrUndefined(x) && !isFunction(x) && isValidLength(x.length);

export const isNativePromise = isObjectOfType('Promise')

const hasPromiseAPI = x => isObject(x) && isFunction(x.then) && isFunction(x.catch)

export const isPromise = x => isNativePromise(x) || hasPromiseAPI(x)

export const isIterable = x => !isNullOrUndefined(x) && isFunction(x[Symbol.iterator])

export const isGenerator = x => isIterable(x) && isFunction(x.next) && isFunction(x.throw)

export const isRegExp = isObjectOfType('RegExp')

export function curryFileTransformer(fn) {
  return function (file: File, cb) {
    const res = fn(file)
    if (isPromise(res)) {
      res.then(asyncRes => {
        if (asyncRes === null) {
          cb()
        } else {
          cb(null, file)
        }
      }).catch(error => {
        console.log(error)
      })
    } else {
      if (res === null) {
        cb()
      } else {
        cb(null, file)
      }
    }
  }
}

export function getRenamerByConfig(renameConfig: RenameConfig, context: any): (filepath: string) => string {
  return function (filepath: string) {
    Object.keys(renameConfig).forEach(pattern => {
      let condition = renameConfig[pattern]
      if (/(\?|\=)/.test(condition)) {
        try {
          condition = evaluate(condition, context)
        } catch (error) {
          console.log(error)
        }
      }
      if (isNull(condition)) {
        return
      }
      filepath = filepath.replace(new RegExp(pattern, 'g'), condition)
    })
    return filepath
  }
}

export function evaluate(exp: string | boolean, data: any) {
  /* eslint-disable no-new-func */
  const fn = new Function('data', 'with (data) { return ' + exp + '}')
  try {
    return fn(data)
  } catch (e) {
    throw new Error('Error when evaluating filter condition: ' + exp)
  }
}
