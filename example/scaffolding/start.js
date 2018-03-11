const path = require('path')
const inquirer = require('inquirer')
const pupa = require('pupa')
const alphax = require('../../dist/alphax')

const app = alphax()

app
  .src('**', { baseDir: path.resolve('template') })
  .task(prompt)
  .task(log)
  .transform(template)
  .rename(filepath => {
    return filepath.replace('{name}', app.meta.name)
  })
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
  return inquirer.prompt([
    {
      name: 'name',
      message: `what's your project's name:`,
      validate: v => /[a-zA-Z0-9_-]*/.test(v)
    },
    {
      name: 'test',
      message: 'Do you want unit test:',
      type: 'confirm'
    }]).then((answers) => {
    Object.assign(app.meta, answers)
  })
}

function log() {
  console.log('Finished')
}

function template(content) {
  return pupa(content, app.meta)
}
