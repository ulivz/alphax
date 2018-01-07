/**
 * data types check util
 * Modified from https://github.com/sindresorhus/is/blob/master/index.js
 */

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
