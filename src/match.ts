import minimatch from 'minimatch'
import { isArray, isString } from './utils'

// ('a/b', 'a/b.js')  => false
// ('a/b', 'a/b')  => true
// ('a', 'b')  => false
// ('a', 'b/b')  => true
// ('a', 'a/b')  => true

// ('a/b', 'a/b/c.js')  => false

const hasSlash = str => str.indexOf('/') !== -1
export function include(a, b) {
  if (hasSlash(a)) {
    return a === b
  }
}
