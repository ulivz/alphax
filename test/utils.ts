import * as path from 'path'
import glob from 'glob'
import { ensureDirSync } from 'fs-extra'

const cwd = process.cwd()
export const SRC_DIR = path.relative(cwd, __dirname + '/fixtures/src')
export const DIST_DIR = path.relative(cwd, __dirname + '/fixtures/dist')

export function getDistDir(dirname) {
  const dist = DIST_DIR + '/' + dirname
  ensureDirSync(dist)
  return dist
}

ensureDirSync(DIST_DIR)

export async function globDir(dir, { baseDir = '.' } = {}) {
  const files: string[] = await new Promise((resolve, reject) => {
    glob(dir + '/**/*', function (er, files) {
      if (er) {
        reject(er)
      } else {
        resolve(files)
      }
    })
  })
  if (baseDir) {
    return files.map(file => path.relative(baseDir, file))
  }
  return files
}

