import path from 'path'
import alphaX from '../src/alphax'

describe('alphax', () => {
  test('base', async () => {
    const app = alphaX()
    await app
      .src(path.join(__dirname, '/fixtures/package/**'), {
        baseDir: path.join(__dirname, '/fixtures/package'),
        filters: {
          'lib': true,
          'lib/util/**': false,
          'style/**': false,
          'index.js': true
        },
        rename: {
          'lib': 'lib2',
          '.js': '.ts'
        },
        transform(content, file) {
          return ' ==== source name is ' + content
        }
      })
      .dest(null)
    expect(app.fileMap()).toMatchSnapshot()
  })

  test('cwd', async () => {
    const app = alphaX()
    const prevCwd = process.cwd()
    process.chdir('test/fixtures')

    await app
      .src('**', {
        baseDir: path.resolve('package'),
        filters: {
          'lib': true,
          'lib/util/**': false,
          'style/**': false,
          'index.js': true
        },
        rename: {
          'lib': 'lib2',
          '.js': '.ts'
        },
        transform(content, file) {
          return ' ==== source name is ' + content
        }
      })
      .dest(null)

    console.log(app.renameChangelog)
    expect(app.fileMap()).toMatchSnapshot()
    process.chdir(prevCwd)
  })

  test('filter function - 1', async () => {
    const app = alphaX()
    const prevCwd = process.cwd()
    process.chdir('test/fixtures')

    await app
      .src('**', {
        baseDir: path.resolve('package'),
        transform(content, file) {
          return file.relative + ': ' + content
        }
      })
      .filter(filepath => filepath.indexOf('style') === -1)
      .dest(null)

    expect(app.fileMap()).toMatchSnapshot()
    process.chdir(prevCwd)
  })

  test('filter function - 2', async () => {
    const app = alphaX()
    const prevCwd = process.cwd()
    process.chdir('test/fixtures')

    await app
      .src('**', {
        baseDir: path.resolve('package'),
        transform(content, file) {
          return file.relative + ': ' + content
        }
      })
      .filter(filepath => filepath.indexOf('style') > -1)
      .dest(null)

    expect(app.fileMap()).toMatchSnapshot()
    process.chdir(prevCwd)
  })

  test('rename function', async () => {
    const app = alphaX()
    const prevCwd = process.cwd()
    process.chdir('test/fixtures')

    await app
      .src('**', {
        baseDir: path.resolve('package'),
        transform(content, file) {
          return file.relative + ': ' + content
        }
      })
      .rename(filepath => {
        if (filepath === 'index.js') {
          return 'main.js'
        }
        if (filepath.indexOf('util') > -1) {
          return filepath.replace('util', 'utils')
        }
        return filepath
      })
      .dest(null)

    expect(app.fileMap()).toMatchSnapshot()
    process.chdir(prevCwd)
  })


})
