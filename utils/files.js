import { execSync } from 'child_process'
/** @type {import('./files').gentlyCopy} */
export function gentlyCopy(filesList, dest, opt = {}) {
  console.log('\n= Begin copying files')

  if (!Array.isArray(filesList)) {
    filesList = [filesList]
  }

  filesList.forEach(function (file) {
    if (opt.overwrite) {
      console.log(' - Overwriting file or directory:', file)
      execSync(`cp -Rf ${file} ${dest}`)
    } else {
      console.log(' - Copying file or directory:', file)
      execSync(`cp -Rn ${file} ${dest}`)
    }
  })

  console.log('= End copying files\n')
}