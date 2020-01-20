function filter(origObj, filterBy) {
  return Object.entries(origObj).reduce((obj, [key, val]) => {
    filterBy(val, key, obj)
    return obj
  }, {})
}

export function flip(obj) {
  return Object.entries(obj).reduce((out, [key, val]) => {
    out[val] = key
    return out
  }, {})
}

export function omit(obj, keys) {
  return Object.entries(obj)
    .filter(([key]) => !keys.includes(key))
    .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {})
}

export function parseFloats(obj, floatKeys) {
  floatKeys.forEach((flt) => {
    if (obj[flt] && typeof obj[flt] === 'string') {
      obj[flt] = parseFloat(obj[flt])
    }
  })
}

export const pick = (obj, keys) => {
  return Object.entries(obj)
    .filter(([key]) => keys.includes(key))
    .reduce((out, [key, val]) => Object.assign(out, { [key]: val }), {})
}

export function prune(origObj) {
  return filter(origObj, (val, key, obj) => val && (obj[key] = val))
}

export const ObjectUtils = Object.freeze({
  flip,
  omit,
  parseFloats,
  pick,
  prune
})
