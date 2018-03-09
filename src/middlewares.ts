import path from 'path'
import * as File from 'vinyl'
import { Renamer, Changelog } from './alphax'

export function getRenameMiddleware(renamers: Renamer[], changelog: Changelog) {
  return function (file: File) {
    const originalName = file.relative
    changelog[originalName] = []
    changelog[originalName].push(originalName)
    renamers.forEach(renamer => {
      let newName
      try {
        newName = renamer(file.relative)
      } catch (error) {
        console.log(error)
      }
      if (newName) {
        file.path = path.join(file.base, newName)
        changelog[originalName].push(file.relative)
      }
    })
  }
}
