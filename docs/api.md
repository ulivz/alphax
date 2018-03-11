# API

```js
import alphax from 'alphax'
const app = alphax()
```

## app.src(globs, [options])

### globs

- Type: `string[] | string`
- Required: `true`

  The directory to find source files by given glob patterns. For example, if you want to check all the files in src, you can use `src/**`.

### options

- Type: `Object`
- Required: `false`

#### baseDir

- Type: `string`
- Required: `false`
- Default: `.`

  Specify a base directory, this path will be used for filter conversion. 
  
  <p class="tip">
    <code>app.src('src/\*\*')</code> is equivalent to <code>app.src('\*\*', { baseDir: 'src'})</code>.
  </p>

#### rename

- Type: `{ [key: string]: string }`
- Required: `false`

  A plain object for rename:
  
  ```js
  rename: {
    'a': 'A', // file names(file paths) that contains 'a' will be replaced with 'A'.
    '.js': '.ts' // modify the file extension.
  }
  ```

#### filters

- Type: `{ [key: string]: string }`
- Required: `false`

  A plain object for filtering files, whose key can be a relative file path or glob string:
  
  ```js
  filters: {
    'src/**': true, // contents of 'src' will be excluded.
    'app/**': false  // contents of 'app' will be included.
  }
  ```

#### transform

- Type: `(contents: string, file: File) => Promise<string> | string`
- Required: `false`

  A transform function, the first parameter is each file's contents, and each file's [vinyl file](https://github.com/gulpjs/vinyl) object will be passed as the second parameter, the returned string will be the new contents of the file.

#### tasks

- Type: `Task | Task[]`
- Required: `false`
  
  Tasks of serial execution, can be a synchronous or asynchronous(return Promise) function. It will be executed in turn before the real dest process. to build a pure function, **current app instance will be passed as the first parameter**.

  ```js
  function task1() {} // return Promise.  
  function task2() {} // return void.
  function task3() {} // return Promise.

  // Tasks will be executed sequentially
  tasks: [task1, task2, task3]
  ```

#### use

- Type: `(file: File, meta: any) => any | Array<(file: File, meta: any) => any>`
- Required: `false`

  Middleware for processing each file , it will be executed in turn at the earliest stage of processing each file. alphax use [**_ware_**](https://github.com/segmentio/ware) to create middleware layer. A middleware accepts a [**_vinyl_**](https://github.com/gulpjs/vinyl) file instance as the first parameter, and [**_meta_**](#app-meta). as the second parameter, you can do any possible convesion of file in the middleware. 
  
  Define a simple logger middleware:

  ```js
  use: (file, meta) => {
    console.log('Starting processing: ' + file.relative)
  }
  ```
  
  The internal [_**rename**_](#rename) feature's implementation is also based on using middleware. 

<p class="tip">
  Rest available options please refers to [**_vinyl-fs_**](https://github.com/gulpjs/vinyl-fs).
</p>
 
  
## app.dest([destPath], [options])

- Return: `Promise<files>`

### destPath

- Type: `string`
- Required: `false`

  The real dest process. All selected files by globs will be passed through the middleware, filter, renmae, transform, and the final files will be generated. At this comment, an alphax app's life ends.


### options

#### write

- Type: `boolean`
- Required: `false`
- default: `true`

  Whether to write the files or not. it's set to false for testing usually.
  
  ```js
  app.src('./src/**').dest()
  // or: app.src('./src/**').dest(null)
  // or: app.src('./src/**').dest('./dist', { write: false })
  ```
  

## app.use(middleware)

FP grammar sugar for [**_option.use_**](#use).

```js
app.use((file) => {
  console.log('Starting processing: ' + file.relative)
})
```

## app.task(task)

FP grammar sugar for [**_option.tasks_**](#tasks).

```js
app.task((app) => {
  return prompt(/* prompts */).then((anwsers)=>{
    app.meta = anwsers
  })
})
```

## app.filter(filter)

FP grammar sugar for [**_option.filters_**](#filters).

```js
app.filter(filepath => filepath.endsWith('.js')) // Only includes JavaScript files
```

## app.rename(renamer)

FP grammar sugar for [**_option.rename_**](#rename).

```js
app.rename(filepath => filepath.replace('{name}', myName))
```

## app.transform(transformFn)

FP grammar sugar for [**_option.transform_**](#transform).

```js
app.transform(contents=> handlebars.render(contents, ctx))
```

## app.fileContent(filepath)

Retrieve the file content through the file path.

```js
app.fileContent('src/index.js') // => get the final content string
```

<p class="warning">
  Since `alphax` would rename files, when you use the initial relative path of the file, you may not be able to get the content of the file you want. and you can get the final name of the file through [**_renameChangelog_**](#app-renamechangelog).
</p>


## app.fileMap()

Returns a map whose key is the file's final relative path, and the value is the file's final content.


## app.fileList()

Returns a array that contains all the final file's relative paths.


## app.files

A map of all final files' metadata. whose key is the file's final relative path, and the value is the [**_vinyl_**](https://github.com/gulpjs/vinyl) file instance.

## app.renameChangelog

A map of all files's rename changelog. for exmaple. if there is file named `src/app.js`, and you wrote 2 filter function:

```js
app.src('src/app.js')
  .filter(filepath => filepath.replace('.js', '.ts'))
  .filter(filepath => filepath.replace('app', 'index'))
  .dest(null)  
  .then(files => {
    console.log(app.renameChangelog)
  })
```

Then the renameChangelog will be:

```json
{
  "src/app.js": [
    "src/app.js",
    "src/app.ts",
    "src/index.ts"
  ]
}
```

## app.meta

An object which is shared across middlewares, you can use this to pass down data from a middleware to another.
