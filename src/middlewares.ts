import path from 'path'
import * as File from 'vinyl'
import { Renamer, Changelog } from './alphax'

export function getRenameMiddleware(renamers: Renamer[], changelog: Changelog) {
  return function (file: File) {
    const originalName = file.relative
    changelog[originalName] = []
    changelog[originalName].push(originalName)
    renamers.forEach(renamer => {
      let oldName = file.relative
      let newName
      try {
        newName = renamer(oldName)
      } catch (error) {
        console.log(error)
      }
      if (newName !== oldName) {
        file.path = path.join(file.base, newName)
        changelog[originalName].push(file.relative)
      }
    })
  }
}
