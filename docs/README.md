<p align="center">
  <img src="https://raw.githubusercontent.com/ulivz/alphax/master/.media/alphax.png" alt="">
  <br><b><i>Fueling your scaffolding.</i></b>
</p>

## Features

* 🚀 Fast, based on stream.
* 📦 Chained API.
* 💅 Using **_middlewares_** to process each file.
* 🚨 Asynchronous task control.
* 🌈 Filter or Rename files with a pure function or configuration.
* 💎 Support **_Conditional Manipulation_**

## Quick Start

Take coping files as an example, if you want to copy all the files from `./src` to `./dist`, you can just do this:

```js
import alphax from 'alphax'
alphax().src('./src/**').dest('./dist')
```

Of course, alphax is far more than that, check out the [**_API_**](/api).
