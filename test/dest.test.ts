import * as path from 'path'
import * as File from 'vinyl'
import dest from '../src/dest'
import { SRC_DIR, getDistDir, globDir } from './utils'

describe('dest', () => {

  test('basic', async () => {
    const DIST_DIR = getDistDir('basic')
    await dest(SRC_DIR + '/**', DIST_DIR)
    const files = await globDir(DIST_DIR, { baseDir: DIST_DIR })
    expect(files).toMatchSnapshot()
  })

  test('ignore', async () => {
    const DIST_DIR = getDistDir('ignore')
    await dest(
      [
        SRC_DIR + '/**',
        '!' + SRC_DIR + '/d.js',
        '!' + SRC_DIR + '/a/b.js'
      ],
      DIST_DIR,
      {
        allowEmpty: true
      }
    )
    const files = await globDir(DIST_DIR, { baseDir: DIST_DIR })
    expect(files).toMatchSnapshot()
  })

  test('rename', async () => {
    const DIST_DIR = getDistDir('rename')
    await dest(
      [
        SRC_DIR + '/**'
      ],
      DIST_DIR,
      {
        allowEmpty: true,
        transformer: (file: File) => {
          // Rename all files to ts
          file.path = path.join(file.base, (<string>file.relative).replace('.js', '.ts'))
          // Rename dir
          file.path = path.join(file.base, (<string>file.relative).replace('a', 'A'))
        }
      }
    )
    const files = await globDir(DIST_DIR, { baseDir: DIST_DIR })
    expect(files).toMatchSnapshot()
  })

})
