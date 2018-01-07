const globby = require('globby')
const glob = require('glob')
const path = require('path')

globby(['test/**/*', '!test/fixtures/**/*'])
  .then(files => {
    console.log(files)
  })


glob('*', function (er, files) {
  console.log(files)
  // files is an array of filenames.
  // If the `nonull` option is set, and nothing
  // was found, then files is ["**/*.js"]
  // er is an error object or null.
})

/* { cwd: path.resolve(__dirname, 'src') }*/


// let a = ['a/b.js', 'a/b/c.js', 'a/b/c/d']
//
// let tokens = new Set(a)
//
// a = a.map(i => i.split('/'))
//
// for (let item of a) {
//   item.pop()
//   while (item.length) {
//     tokens.add(item.join('/'))
//     item.pop()
//   }
// }
//
// console.log([...tokens])
