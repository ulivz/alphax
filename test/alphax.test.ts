import path from 'path'
import alphaX from '../src/alphax'

describe('alphax', () => {
  test('base', async () => {
    const app = alphaX()
    await app
      .src(path.join(__dirname, '/fixtures/src/**'), {
        baseDir: path.join(__dirname, '/fixtures/src'),
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
          return file.relative + ': ' + content
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
        baseDir: path.resolve('src'),
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
          return file.relative + ': ' + content
        }
      })
      .dest(null)

    expect(app.fileMap()).toMatchSnapshot()
    process.chdir(prevCwd)
  })

})
