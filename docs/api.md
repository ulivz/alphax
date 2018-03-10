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

#### rename

- Type: `{ [key: string]: string }`
- Required: `false`

  An object for rename. For example:
  
  ```js
  rename: {
    'a': 'A', // All filenames containing 'a' will replace 'a' with 'A'
    '.js': '.ts' // Modify the file extension
  }
  ```

#### filter

- Type: `{ [key: string]: string }`
- Required: `false`

  An object for filter. For example:
  
  ```js
  filter: {
    'src/**': data.src, // The contents of src will be copied only if data.src is true 
    'app/**': data.app  // ditto.
  }
  ```

#### transform

- Type: `(contents: string, file: File) => Promise<string> | string`
- Required: `false`

  A transform function, the first parameter is each file's contents, and each file's [vinyl file](https://github.com/gulpjs/vinyl) object will be passed as the second parameter, the returned string will be the new contents of the file.

#### baseDir

- Type: `string`
- Required: `false`
- Default: `.`

  Specify a baseDir, this path will be used for filter conversion.


#### tasks

- Type: `Task | Task[]`
- Required: `false`
- Default: `[]`

  Tasks of serial execution, can be a synchronous or asynchronous(return Promise) function. It will be executed in turn before the real dest process.


#### use

- Type: `Middleware | Middleware[]`
- Required: `false`
- Default: `[]`

  Middleware for file processing, it will be executed in turn at the earliest stage of processing each file.
 

?> Rest options please refers to [vinyl-fs](https://github.com/gulpjs/vinyl-fs)
  

### app.use(middleware)

#### middleware

- Type: `(ctx: File) => any`
- Required: `false`

  alphax use [ware](https://github.com/segmentio/ware) to create middleware layer. All middlewares will run sequentially at the beginning of each file dest. A middleware accepts a [vinyl file](https://github.com/gulpjs/vinyl) as the first parameter, and you can do any possible convesion of file in the middleware. 
  
  A simple logger middleware:
  
  ```js
  app.use((file) => {
	  console.log('Start to dest file: ' + file.relative)
  })
  ```
  
!> The internal [rename](#options-rename) function's implementation is based on using middleware. 
  
  
### app.dest(destPath, [options])

#### destPath

- Type: `string`
- Required: `true`

  The real dest process. All selected files by globs will be passed through the middleware, filter, renmae, transform, and the final files will be generated. At this comment, an alphax app's life ends.
  

### app.task(task)

#### task

- Type: `(app: AlphaX) => Promise<void> | void`


### app.filter(filter)

#### filter

- Type: `(filepath: string) => string`


### app.rename(renamer)

#### renamer

- Type: `(filepath: string) => string`


### app.transform(transformFn)

#### transformFn

- Type: `(contents: string, file: File) => Promise<string> | string`


### app.fileContent(filepath)

#### filepath

- Type: string


### app.fileMap()


### app.fileList()


### app.files

### app.renameChangelog

### app.meta
