import { parseStringPromise } from 'xml2js'

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

export function startCase(str) {
  return ( str[0].toUpperCase() 
  + str.slice(1) ).replace(/([a-z])([A-Z])/g, '$1 $2')
}

export { parseStringPromise as parseXML }

const StringUtils = { camelCase, startCase, parseXML: parseStringPromise }

export default Object.freeze(StringUtils)