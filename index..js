const filter = {
  'a': true,
  'b/**': false,
  'c.js': false
}

const rename = {
  'a': 'A',
  '.js': '.ts'
}

const transformFn = function (content) {
  return `/* Created at ${new Date().toLocaleTimeString()} */` + content
}

app
  .src('./**', {
    filter,
    rename,
    transformFn
  })
  .dest('./dist')
