import * as path from 'path'
import * as File from 'vinyl'
import dest from '../src/dest'
import { SRC_DIR, DIST_DIR, getDistDir } from './utils'

describe('dest', () => {

  test('BASE', async () => {
    await dest(SRC_DIR, getDistDir('BASE'))
  })

  test('IGNORE', async () => {
    await dest(
      [
        SRC_DIR + '/**',
        '!' + SRC_DIR + '/d.js',
        '!' + SRC_DIR + '/a/b.js'
      ],
      getDistDir('IGNORE'),
      {
        allowEmpty: true
      }
    )
  })

  test('RENAME', async () => {
    await dest(
      [
        SRC_DIR + '/**'
      ],
      getDistDir('RENAME'),
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
  })

})
