# Condiitonal Manipulation

With the provided [functional programming API](/api?id=app-filterfilter), we can implement the conditional manipulation function manually, but it's exciting to know that starting from `@1.0.3`, `alphaX` will support built-in conditional filtering and renaming.

Above all, assuming your source tree is like this:

```
├── index.js
├── lib
│   └──core.js
└── style
    └── index.css
```

## Condiitonal Filtering

Usually, we can exclude the `lib/**` by configuring like this:

```js
const app = alphax()
  .src('**', {
    context,
    filters: {
      'lib/**': false
    }
  })
```

If you want to decide whether the glob's target file is included at runtime, you can do this:

```js
const context = {}

const app = alphax()
  .src('**', {
    context,
    filters: {
      'lib/**': 'mode === "scss"'
    }
  })
```

In the above example, `lib/**` will be included only if `context.mode` is equal to `scss`.


<p class="tip">
  The values of each filter supports any legal javascript expression.
</p>

## Condiitonal Renaming

Similar to `Condiitonal Filtering`, you can decide whether to rename a file at runtime based on the dynamic context:

```js
const context = {}

const app = alphax()
  .src('**', {
    context,
    rename: {
      'index.css':
        'mode === "scss" ? "index.scss" : null'
    }
  })
```

In the above example, the `index.css` will be renamed to `index.scss` only if `context.mode` is equal to `scss`, and `null` is to tell alphaX to keep the original file name.




