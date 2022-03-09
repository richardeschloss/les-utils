/** @type {import('./array').omit} */
export function omit(arr, keys) {
  return arr.map((obj) => {
    return Object.entries(obj)
      .filter(([key]) => !keys.includes(key))
      .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {})
  })
}

/** @type {import('./array').pick} */
export function pick(arr, keys) {
  return arr.map((obj) => {
    return Object.entries(obj)
      .filter(([key]) => keys.includes(key))
      .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {})
  })
}

/** @type {import('./array').upsert} */
export function upsert(arr = [], obj = {}, keyBy = 'symbol') {
  const fnd = arr.find((o) => o[keyBy] === obj[keyBy])
  if (fnd) {
    Object.assign(fnd, obj)
  } else {
    arr.push(obj)
  }
}

function sortBy(arr, key, valKey) {
  const copy = [...arr]
  return copy.sort((a, b) => {
    const aVal = valKey ? a[key][valKey] : a[key]
    const bVal = valKey ? b[key][valKey] : b[key]
    if (aVal > bVal) {
      return 1
    } if (aVal < bVal) {
      return -1
    } else {
      return 0
    }    
  })
}

const ArrayUtils = { omit, pick, upsert, sortBy }

export default Object.freeze(ArrayUtils)
