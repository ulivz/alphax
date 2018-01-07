import fs from 'fs-extra'
import fx from '../src2/index.ts'

function beautifyJSON(ob) {
  return JSON.stringify(ob, null, 2)
}

const SRC_DIR = __dirname + '/fixtures/src'
const DIST_DIR = __dirname + '/fixtures/dist'

fs.ensureDirSync(DIST_DIR)

describe('file-system - base', () => {

  test('toJSON', async () => {
    const node = fx(SRC_DIR)
    await node.traverse()
    const json = node.toJSON()
    expect(json).toMatchSnapshot()
  })

  test('flatten', async () => {
    const node = fx(SRC_DIR)
    await node.traverse()
    const json = node.flatten(li => li._toJSON())
    expect(json).toMatchSnapshot()
  })
})

describe('file-system - dest', () => {
  test('ignore - string', async () => {
    const node = fx(SRC_DIR)
    await node.traverse()
    node.ignore('d.js')
    const files = await node.dest(DIST_DIR, { write: false })
    expect(files.find(file => file.basename === 'd.js')).toBe(undefined)
    expect(files.length).toBe(4)
    expect(files).toMatchSnapshot()
  })

  test('ignore - glob string - 1', async () => {
    const node = fx(SRC_DIR)
    await node.traverse()
    node.ignore('**/*.js')
    const files = await node.dest(DIST_DIR, { write: false })
    expect(files.length).toBe(2)
    expect(files).toMatchSnapshot()
  })

  test('ignore - glob string - 2', async () => {
    const node = fx(SRC_DIR)
    await node.traverse()
    node.ignore('a')
    const files = await node.dest(DIST_DIR, { write: false })
    console.log(files)
  })

  test('rename', async () => {
    const node = fx(SRC_DIR)
    await node.traverse()
    node.nodes[0].rename('ds')
    const files = await node.dest(DIST_DIR, { write: false })
    console.log(files)
  })

})

