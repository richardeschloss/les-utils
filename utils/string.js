import { parseString } from 'xml2js'

/** @type {import('./string').stringTostring} */
export function camelCase (str) {
  return str
    .replace(/\s(.)/g, function($1) {
      return $1.toUpperCase()
    })
    .replace(/\s/g, '')
    .replace(/^(.)/, function($1) {
      return $1.toLowerCase()
    })
    .replace(/[^\w\s]/gi, '')
}

/** @type {import('./string').stringTostring} */
export const startCase = (str) => 
  ( str[0].toUpperCase() 
  + str.slice(1) ).replace(/([a-z])([A-Z])/g, '$1 $2')

/** @type {import('./string').parseXML} */
export function parseXML(xml) {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, json) => {
      if (err) {
        reject(err)
      } else {
        resolve(json)
      }
    })
  })
}

const StringUtils = { camelCase, startCase, parseXML }

export default Object.freeze(StringUtils)