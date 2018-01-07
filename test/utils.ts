import * as path from 'path'
import { ensureDirSync } from 'fs-extra'

const cwd = process.cwd()
export const SRC_DIR = path.relative(cwd, __dirname + '/fixtures/src')
export const DIST_DIR = path.relative(cwd, __dirname + '/fixtures/dist')

export const getDistDir = dirname => {
  const dist = DIST_DIR + '/' + dirname
  ensureDirSync(dist)
  return dist
}

ensureDirSync(DIST_DIR)
