# alphaX

<p align="center">
 <b><i>Fuel of scaffolding.</i></b>
</p>

## Features

* 🚀 Fast, based on stream.
* 📦 Chained API.
* 💅 Using middlewares to process each file.
* 🚨 Asynchronous task control.
* 🌈 Renaming file with a pure function or configuration.
* 🎯 Filtering file with a pure function or configuration.

## Quick Start

Take file copy as an example, if you want to copy all the files in './src' to './dist', You can do this:

```js
import alphax from 'alphax'

alphax().src('./src/**').dest('./dist')
```

Check out all the [APIs](/api) or [Tips](/tips)
