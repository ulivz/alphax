import path from 'path'
import alphaX from '../src/alphax'

/**
 * Create a alphaX app with pure src config.
 * @param {Object} srcConfig
 * @returns {AlphaX}
 */
function getApp(srcConfig?: Object = {}) {
  const app = alphaX()
  return app.src(path.join(__dirname, 'fixtures/package/**'), {
    baseDir: path.join(__dirname, 'fixtures/package'),
    transform(content, file) {
      return `[${file.originalRelative}]`
    },
    ...srcConfig
  })
}

test('should basic function work - using cwd as baseDir', async () => {
  const app = alphaX()
  const prevCwd = process.cwd()
  process.chdir('test/fixtures/package')

  const files = await app
    .src('**', {
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
      transform(content) {
        return `[${content.replace('\n', '')}]`
      }
    })
    .dest(null)

  expect(files).toMatchSnapshot()
  process.chdir(prevCwd)
})


test('should basic function work - customize baseDir', async () => {
  const app = getApp({
    filters: {
      'lib': true,
      'lib/util/**': false,
      'style/**': false,
      'index.js': true
    },
    rename: {
      'lib': 'lib2',
      '.js': '.ts'
    }
  })
  const files = await app.dest(null)
  expect(files).toMatchSnapshot()
})


test('should filter function work - normal', async () => {
  const app = getApp()
  const files = await app
    .filter(filepath => filepath.indexOf('style') === -1)
    .dest(null)
  expect(files).toMatchSnapshot()
})

test('should filter function work - reverse', async () => {
  const app = getApp()
  const files = await app
    .filter(filepath => filepath.indexOf('style') > -1)
    .dest(null)
  expect(files).toMatchSnapshot()
})

test('should rename function work', async () => {
  const app = getApp()
  const files = await app
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
  expect(files).toMatchSnapshot()
})

test('should conditional filter work - exclude', async () => {
  const app = getApp({
    context: {
      mode: 'js'
    },
    filters: {
      'lib/**': 'mode === "ts"',
    }
  })
  const files = await app.dest(null)
  expect(files).toMatchSnapshot()
})

test('should conditional filter work - include', async () => {
  const app = getApp({
    context: {
      mode: 'js'
    },
    filters: {
      'lib/**': 'mode === "js"',
    }
  })
  const files = await app.dest(null)
  expect(files).toMatchSnapshot()
})

test('should conditional renamer work - normal', async () => {
  const app = getApp({
    context: {
      mode: 'scss'
    },
    rename: {
      'style': "mode === 'scss' ? 'scss' : null"
    }
  })
  const files = await app.dest(null)
  expect(files).toMatchSnapshot()
})

test('should conditional renamer work - reverse', async () => {
  const app = getApp({
    context: {
      mode: 'less'
    },
    rename: {
      'style': "mode === 'scss' ? 'scss' : null"
    }
  })
  const files = await app.dest(null)
  expect(files).toMatchSnapshot()
})
