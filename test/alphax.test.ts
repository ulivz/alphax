import alphaX from '../src/alphax'
import { SRC_DIR, getDistDir, globDir } from './utils'

const config = {
  filter: {
    'a': true,
    'a/b/**': false,
    'd.js': false
  },
  rename: {
    'a': 'A',
    '.js': '.ts'
  },
  transformFn(content, file) {
    console.log('Transform file: ' + file.relative)
    return `/* Created at ${new Date().toLocaleTimeString()} */` + content
  }
}

describe('alphax', () => {

  test('base', async () => {
    const DIST_DIR = getDistDir('alphax-base')
    const app = alphaX()
    await app
      .src(SRC_DIR + '/**', Object.assign({ baseDir: SRC_DIR }, config))
      .dest(DIST_DIR)
    const files = await globDir(DIST_DIR, { baseDir: DIST_DIR })
    expect(files).toMatchSnapshot()
  })

  test('cwd', async () => {
    const DIST_DIR = 'dist/alphax-cwd'
    const app = alphaX()

    let prevCwd = process.cwd()
    process.chdir('test/fixtures')

    await app
      .src('src/**', Object.assign({ baseDir: 'src' }, config))
      .dest(DIST_DIR)
    const files = await globDir(DIST_DIR, { baseDir: DIST_DIR })
    expect(files).toMatchSnapshot()
    process.chdir(prevCwd)
  })

})
