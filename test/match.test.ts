import { match } from '../src/match'

describe('minimatch', () => {

  test('match', () => {
    let pattern
    let path

    pattern = '*.js'
    path = 'bar.js'
    expect(match(path, pattern)).toBe(true)

    pattern = ['*.js', '*.css']
    path = 'bar.js'
    expect(match(path, pattern)).toBe(true)

    pattern = ['*.html', '*.css']
    path = 'bar.js'
    expect(match(path, pattern)).toBe(false)

    pattern = ['README*']
    path = 'README.md'
    expect(match(path, pattern)).toBe(true)

    pattern = ['!README*']
    path = 'README.md'
    expect(match(path, pattern)).toBe(false)

    pattern = 'src'
    path = 'src/a.js'
    expect(match(path, pattern)).toBe(true)

    pattern = 'src/**'
    path = 'src/a.js'
    expect(match(path, pattern)).toBe(false)
  })

})
