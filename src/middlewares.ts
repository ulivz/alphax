import * as File from 'vinyl'
import { Renamer, Changelog } from './alphax'

export function getRenameMiddleware(renamers: Renamer[], changelog: Changelog) {
  return function (file: File) {
    changelog[file.relative].push(file.relative)
    renamers.forEach(renamer => {
      let newName
      try {
        newName = renamer(file)
      } catch (error) {
        console.log(error)
      }
      if (newName) {
        console.log(newName)
        file.relative = newName
        changelog[file.relative].push(file.relative)
      }
    })
  }
}
