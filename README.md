<p align="center">
  <img src="https://raw.githubusercontent.com/ulivz/alphax/master/.media/alphax.png" alt="">
</p>

<p align="center">
<a href="https://npmjs.com/package/alphax"><img src="https://img.shields.io/npm/v/alphax.svg?style=flat" alt="NPM version"></a> 
<a href="https://npmjs.com/package/alphax"><img src="https://img.shields.io/npm/dm/alphax.svg?style=flat" alt="NPM downloads"></a> 
<a href="https://circleci.com/gh/ulivz/alphax"><img src="https://img.shields.io/circleci/project/ulivz/alphax/master.svg?style=flat" alt="Build Status"></a>
<a href="https://github.com/ulivz/donate"><img src="https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&amp;style=flat" alt="donate"></a> 
<a href="https://codecov.io/gh/ulivz/alphax" alt="codecov"> <img src="https://codecov.io/gh/ulivz/alphax/branch/master/graph/badge.svg?maxAge=2592000&amp;style=flat"></img> </a>
</p>

<p align="center">
  <b><i>Fueling your scaffolding.</i></b>
</p>

## What is alphaX?

alphaX provides very simple _JSON-like_ and _chained_ APIs that allow you to manipulate files freely. Now it supports [**_glob_**](https://github.com/isaacs/node-glob), **_task control_**, **_middleware_**, **_rename_**, **_filter_** and **_transform file_** as well.

BTW, alphaX was named from the Greek initials _**α**_ and [spaceX](http://www.spacex.com/) I admire.


## Features

* 🚀 Fast, based on stream.
* 📦 Chained API.
* 💅 Using middlewares to process each file.
* 🚨 Asynchronous task control.
* 🌈 Renaming files with a pure function or configuration.
* 🎯 Filtering files with a pure function or configuration.


## Install

```bash
npm i alphax --save 
# Pay attention to the case, NPM does not support capitals. 😅
# Or yarn add alphax
```

## Usage

```js
import alphax from 'alphax'
// Or cjs: const app = require('alphax')
const app = alphax()
```

- **_Chained Style_**

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

- **_Config Style_**

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

For detailed usage please head to [v2js.com/alphax](http://www.v2js.com/alphax).

## Projects Using alphaX

- [**_poz_**](https://github.com/ulivz/poz): Programmable scaffolding generator. 🏹 
- Feel free to add yours here :)


## Prior art

alphaX wouldn't exist if it wasn't for excellent prior art, alphaX is inspired by these projects:

- [**_vinyl-fs_**](https://github.com/gulpjs/vinyl-fs)
- [**_majo_**](https://github.com/egoist/majo)


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**alphaX** © [ulivz](https://github.com/ULIVZ), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by ulivz with help from contributors ([list](https://github.com/ULIVZ/alphax/contributors)).

> [github.com/ulivz](https://github.com/ulivz) · GitHub [@ulivz](https://github.com/ULIVZ)
