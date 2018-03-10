<p align="center">
  <img src="./.media/alphax.png" alt="">
</p>

<p align="center">
<a href="https://npmjs.com/package/alphax"><img src="https://img.shields.io/npm/v/alphax.svg?style=flat" alt="NPM version"></a> 
<a href="https://npmjs.com/package/alphax"><img src="https://img.shields.io/npm/dm/alphax.svg?style=flat" alt="NPM downloads"></a> 
<!-- <a href="https://circleci.com/gh/ulivz/alphax"><img src="https://img.shields.io/circleci/project/ulivz/alphax/master.svg?style=flat" alt="Build Status"></a> --> 
<a href="https://github.com/ulivz/donate"><img src="https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&amp;style=flat" alt="donate"></a> 
<a href="https://codecov.io/gh/ulivz/alphax" alt="codecov"> <img src="https://codecov.io/gh/ulivz/alphax/branch/master/graph/badge.svg?maxAge=2592000&amp;style=flat"></img> </a>
</p>

<p align="center">
  <b><i>Fuel of scaffolding.</i></b>
</p>

## What is alphax?

alphax provides very simple JSON-like and chained APIs that allow you to manipulate files freely. Now it supports [glob](https://github.com/isaacs/node-glob), task, reanme, filter and transform file during dest.

BTW, alphax was named from the Greek initials _**α**_ and [spaceX](http://www.spacex.com/) I admire.

## Install

```bash
npm i alphax --save
# yarn add alphax
```

## Usage

```js
import { alphax } from 'alphax'
// Or cjs: const app = require('alphax')
const app = alphax()
```

- Chained Style

```js
alphax()
  .src('**')
  .task(task1)
  .task(task2)
  .task(task3)
  .use(file => file.content += Date.now())
  .rename(filepath => filepath.replace('{name}', name))
  .rename(filepath => filepath.replace('{age}', age))
  .transform(content => content.replace('{name}', name))
  .filter(filepath => filepath.endWith('.js'))
  .filter(filepath => !filepath.startWith('test'))
  .dest('dist')
  .then(files => console.log(files))
  .catch(error => console.log(error))
```

- Config Style

```js
const config = {
  tasks: [task1, task3, task3],
  use: file => file.content += Date.now(),
  rename: {
    '{name}': name,
    '{age}': age
  },
  filter: {
    'app.js': true,
    'test.js': false
  },
  transform(content) {
    return content.replace('{name}', name)
  }
}

alphax()
  .src('**', config)
  .dest('dist')
  .then(files => console.log(files))
  .catch(error => console.log(error))
```



## API

### app.src(globs, [options])

#### globs

- Type: `string[] | string`
- Required: `true`

  The directory to find source files by given glob patterns. For example, if you want to check all the files in src, you can use `src/**`.

#### options

##### options.rename

- Type: `{ [key: string]: string }`
- Required: `false`

  An object for rename. For example:
  
  ```js
    rename: {
      'a': 'A', // All filenames containing 'a' will replace 'a' with 'A'
      '.js': '.ts' // Modify the file extension
    }
  ```

##### options.filter

- Type: `{ [key: string]: string }`
- Required: `false`

  An object for filter. For example:
  
  ```js
    filter: {
      'src/**': data.src, // The contents of src will be copied only if data.src is true 
      'app/**': data.app  // ditto.
    }
  ```

##### options.transformFn

- Type: `(contents: string, file: File) => Promise<string> | string`
- Required: `false`

  A transform function, the first parameter is each file's contents, and each file's [vinyl file](https://github.com/gulpjs/vinyl) object will be passed as the second parameter, the returned string will be the new contents of the file.

##### options.baseDir

- Type: `string`
- Required: `false`
- Default: `.`

  Specify a baseDir, this path will be used for filter conversion.


### app.use(middleware)

#### middleware

- Type: `(ctx: File) => any`
- Required: `false`

  alphax use [ware](https://github.com/segmentio/ware) to create middleware layer. All middlewares will run sequentially at the beginning of each file dest. A middleware accepts a [vinyl file](https://github.com/gulpjs/vinyl) as the first parameter, and you can do any possible convesion of file in the middleware. 
 
  The [rename](#options-rename) function is also based on using its own middleware. 
  
  A simple logger middleware:
  
  ```js
  app.use((file) => {
	  console.log('Start to dest file: ' + file.relative)
  })
  ```
  
  
### app.dest(destPath, [options])

#### destPath

- Type: `string`
- Required: `true`

  The real dest process. All selected files by globs will be passed through the middleware, filter, renmae, transform, and the final files will be generated. At this comment, an alphax app's life ends.
  

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**alphax** © [ulivz](https://github.com/ULIVZ), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by ulivz with help from contributors ([list](https://github.com/ULIVZ/alphax/contributors)).

> [github.com/ulivz](https://github.com/ulivz) · GitHub [@ulivz](https://github.com/ULIVZ)
