export function omit(arr, keys) {
  return arr.map((obj) => {
    return Object.entries(obj)
      .filter(([key]) => !keys.includes(key))
      .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {})
  })
}

export function pick(arr, keys) {
  return arr.map((obj) => {
    return Object.entries(obj)
      .filter(([key]) => keys.includes(key))
      .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {})
  })
}

export function upsert({ arr = [], obj = {}, keyBy = 'symbol' }) {
  const fnd = arr.find((o) => o[keyBy] === obj[keyBy])
  if (fnd) {
    Object.assign(fnd, obj)
  } else {
    arr.push(obj)
  }
}

export const ArrayUtils = Object.freeze({
  omit,
  pick,
  upsert
})
