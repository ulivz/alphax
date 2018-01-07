const globby = require('globby')
const path = require('path')

globby(['test/**/*', '!test/fixtures/**/*'])
  .then(files => {
    console.log(files)
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
