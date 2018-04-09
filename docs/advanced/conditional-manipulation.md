# Condiitonal Manipulation

Assuming your source tree is like this:

```
├── index.js
├── lib
│   └──index.js
└── style
    └── index.css
```

## Condiitonal Filter

Obviously, we can exclude the `lib/**` by configuring the following filters.

```js
{
  'lib/**': false
}
```

If you want to decide whether the glob's target file is included at runtime, You can do this:

```js
// This context object stores the user's input information
const context = {}

const app = alphax()
  .src('**', {
    context,
    filters: {
      // 'lib/**' will be included only if context.mode is equal to 'scss'
      'lib/**': 'mode === "scss"'
    }
  })
```

## Condiitonal Rename



