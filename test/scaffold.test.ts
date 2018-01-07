import fs from 'fs-extra'
import sca from '../src/scaffold.ts'

function beautifyJSON(ob) {
  return JSON.stringify(ob, null, 2)
}

const SRC_DIR = __dirname + '/fixtures/src'
const DIST_DIR = __dirname + '/fixtures/dist'

fs.ensureDirSync(DIST_DIR)

describe('scaffold', () => {

  test('1', async () => {
    const app = sca()
    const files = await app.src(['a/**', '!a/b/**'], { baseDir: SRC_DIR })
      .process()
    console.log(files)
  })

})
