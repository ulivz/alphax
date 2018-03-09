const path = require('path')
const ask = require('inquirer')
const pupa = require('pupa')
const alphax = require('alphax')

const app = alphax()

app
  .src('**', { baseDir: path.resolve('template') })
  .task(prompt)
  .transformFn(template)
  .filter(filepath => {
    const { test } = app.meta
    if (!test && filepath === 'test.js') {
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

function prompt(app) {
  return ask.prompt([{
    name: 'name',
    message: `what's your project's name:`,
    validate: v => Boolean(v)
  }, {
    name: 'test',
    message: 'Do you want unit test:',
    type: 'confirm'
  }]).then(answers => {
    app.meta = answers
  })
}

function template(content) {
  return pupa(content, app.meta)
}
