# alphax

[![NPM version](https://img.shields.io/npm/v/alphax.svg?style=flat)](https://npmjs.com/package/alphax) [![NPM downloads](https://img.shields.io/npm/dm/alphax.svg?style=flat)](https://npmjs.com/package/alphax) [![CircleCI](https://circleci.com/gh/ULIVZ/alphax/tree/master.svg?style=shield)](https://circleci.com/gh/ULIVZ/alphax/tree/master)  [![codecov](https://codecov.io/gh/ULIVZ/alphax/branch/master/graph/badge.svg)](https://codecov.io/gh/ULIVZ/alphax)
 [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/ULIVZ/donate)

Fuel of scaffolding.

## What is alphax?

alphax provides JSON-like APIs that allow you to manipulate files freely. Now it supports [glob](https://github.com/isaacs/node-glob), reanme, filter and transform during dest.

BTW, alphx was named from the Greek initials `α` and [spaceX](http://www.spacex.com/) I admire.

## Install

```bash
npm i alphax --save
# yarn add alphax
```

## Usage

```js
import { alphax } from 'alphax'
// Or cjs: const app = require('alphax')

alphax()
  .src('src/**')
  .dest('dist')
```

## API

```js
const app = alphax()
```

### app.src(globs, [options])

#### globs

Type: `string[] | string`
Required: `true`

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

- Type: `(contents: string) => Promise<string> | string`
- Required: `false`

  A transform function, the first parameter is each file's contents, the returned string will be the new contents of the file.

##### options.baseDir

- Type: `string`
- Required: `false`
- Default: `.`

  Specify a baseDir, this path will be used for filter conversion.


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
