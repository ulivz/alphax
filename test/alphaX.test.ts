import fs from 'fs-extra'
import alphaX from '../src/alphaX'
import { SRC_DIR, getDistDir } from './utils'

describe('alphaX', () => {

  test('alphaX01', async () => {
    const app = alphaX()
    app
      .src(
        SRC_DIR + '/**',
        {
          filter: {
            'a': true,
            'a/b/**': false,
            'd.js': false
          },
          rename: {
            'a': 'A',
            '.js': '.ts'
          },
          transformFn(content) {
            return `/* Created at ${new Date().toLocaleTimeString()} */` + content
          }
        }
      )
      .dest(getDistDir('alphaX01'))
  })

})
