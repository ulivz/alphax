import alphaX from '../src/alphax'
import { SRC_DIR, getDistDir, globDir } from './utils'

describe('alphax', () => {

  test('base', async () => {
    const DIST_DIR = getDistDir('alphax-base')
    const app = alphaX()
    await app.src(SRC_DIR + '/*',
      {
        baseDir: SRC_DIR,
        filter: {
          'a': true,
          'a/b': false,
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
      .dest(DIST_DIR)
    const files = await globDir(DIST_DIR, { baseDir: DIST_DIR })
    expect(files).toMatchSnapshot()
  })

  test('cwd', async () => {
    const DIST_DIR = 'dist/alphax-cwd'
    const app = alphaX()

    let prevCwd = process.cwd()
    process.chdir('test/fixtures')

    const config = {
      baseDir: 'src',
      filter: {
        'a': true,
        'a/b': false,
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
    await app
      .src('src/*', config)
      .dest(DIST_DIR)
    const files = await globDir(DIST_DIR, { baseDir: DIST_DIR })
    expect(files).toMatchSnapshot()
    process.chdir(prevCwd)
  })

})
