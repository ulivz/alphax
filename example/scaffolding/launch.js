const path = require('path')
const ask = require('inquirer')
const pupa = require('pupa')
const alphax = require('alphax')

const app = alphax()

app
  .src('**', { baseDir: path.resolve('template') })
  .use(prompt)
  .use(template)
  .filter(filepath => {
    if (filepath === 'test.js' && !stream.meta.test) {
      return false
    }
    return true
  })
  .dest('./output')
  .then(() => {
    console.log(`> Done, checkout ./output directory`)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })

function prompt(stream) {
  return ask.prompt([{
    name: 'name',
    message: `what's your project's name:`,
    validate: v => Boolean(v)
  }, {
    name: 'test',
    message: 'Do you want unit test:',
    type: 'confirm'
  }]).then(answers => {
    stream.meta = answers
  })
}

function template(stream) {
  for (const relative in stream.files) {
    const contents = stream.fileContents(relative)
    // Only does interpolation when `{}` appears
    if (/\{.+\}/.test(contents)) {
      stream.writeContents(relative, pupa(contents, stream.meta))
    }
  }
}