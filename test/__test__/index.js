const { alphax } = require('../../dist/alphax')

const app = alphax()

app
  .src(
    './**',
    {
      filter: {
        'README.md': false,
        'components/**': false
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
  .dest('./dist')
