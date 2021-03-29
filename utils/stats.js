/** @type {import('./stats').deltas} */
export function deltas(arr) {
  return arr.map((c, idx) => (idx > 0 ? c - arr[idx - 1] : 0))
}

/** @type {import('./stats').controlStats} */
export function controlStats(arr, { period = 14, factor = 2 } = {}) {
  const out = {
    mean: Array(period).fill(0),
    ucl: Array(period).fill(0),
    lcl: Array(period).fill(0)
  }
  
  arr.slice(period).forEach((_, idx) => {
    const subset = arr.slice(idx - period, idx)
    const subsetStdev = stddev(subset)
    const _mean = mean(subset)
    const _ucl = _mean + factor * subsetStdev
    const _lcl = _mean - factor * subsetStdev
    out.mean.push(_mean)
    out.ucl.push(_ucl)
    out.lcl.push(_lcl)
  })
  return out
}

/** @type {import('./stats').numArrToNum} */
export const mean = (arr) => arr.length > 0 
  ? sum(arr) / arr.length
  : 0

/** @type {import('./stats').numArrToNum} */
export function stddev(arr) {
  return arr.length > 0 
    ? Math.sqrt(
        sum(arr.map((i) => (i - mean(arr)) ** 2)) / arr.length
      )
    : 0
}

/** @type {import('./stats').numArrToNum} */
export const sum = (arr) => arr.reduce((cum, val) => (cum += val), 0)

const Stats = { 
  deltas, 
  controlStats,
  mean,
  stddev,
  sum 
}

export default Object.freeze(Stats)
