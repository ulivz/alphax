import * as fs from 'fs-extra'
import Directory from './directory_node'
import File from './file_node'

function filex(target: string, cwd?: string) {
  if (!fs.existsSync(target)) {
    throw new Error()
  }
  if (fs.statSync(target).isDirectory()) {
    return new Directory(target, cwd)
  }
  return new File(target, cwd)
}

export { filex as default, Directory, File }
