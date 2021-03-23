/** @type {import('./object').flip} */
export function flip(obj) {
  return Object.entries(obj).reduce((out, [key, val]) => {
    out[val] = key
    return out
  }, {})
}

/** @type {import('./object').omit} */
export function omit(obj, keys) {
  return Object.entries(obj)
    .filter(([key]) => !keys.includes(key))
    .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {})
}

/** @type {import('./object').pick} */
export const pick = (obj, keys) => {
  return Object.entries(obj)
    .filter(([key]) => keys.includes(key))
    .reduce((out, [key, val]) => Object.assign(out, { [key]: val }), {})
}

/** @type {import('./object').prune} */
export function prune(obj) {
  return Object.entries(obj).reduce((out, [key, val]) => {
    if (val) { (out[key] = val) }
    return out
  }, {})
}

const ObjectUtils = {
  flip,
  omit,
  pick,
  prune
}

export default Object.freeze(ObjectUtils)
