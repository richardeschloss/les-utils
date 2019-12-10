import { parseString } from 'xml2js'

export function camelCase (str) {
  return str
    .replace(/\s(.)/g, function ($1) {
      return $1.toUpperCase()
    })
    .replace(/\s/g, '')
    .replace(/^(.)/, function ($1) {
      return $1.toLowerCase()
    })
    .replace(/[^\w\s]/gi, '')
}

export function startCase (str) {
  return str[0].toUpperCase() + str.slice(1)
}

export function parseXML (xml) {
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
