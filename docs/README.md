<p align="center">
  <img src="https://raw.githubusercontent.com/ulivz/alphax/master/.media/alphax.png" alt="">
  <br><b><i>Fuel of scaffolding.</i></b>
</p>

## Features

* 🚀 Fast, based on stream.
* 📦 Chained API.
* 💅 Using middlewares to process each file.
* 🚨 Asynchronous task control.
* 🌈 Renaming files with a pure function or configuration.
* 🎯 Filtering files with a pure function or configuration.

## Quick Start

Take coping files as an example, if you want to copy all the files from `./src` to `./dist`, you can just do this:

```js
import alphax from 'alphax'
alphax().src('./src/**').dest('./dist')
```

Of course, alphax is far more than that, check out the [**_API_**](/api) and [**_example/scaffolding_**](/example/scaffolding)
