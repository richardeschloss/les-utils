/** @type {import('./stats').deltas} */
export function deltas(arr) {
  return arr.map((c, idx) => (idx > 0 ? c - arr[idx - 1] : 0))
}

/** @type {import('./stats').controlStats} */
export function controlStats(arr, { period = 20, factor = 2 } = {}) {
  const out = {
    mean: Array(period).fill(0),
    ucl: Array(period).fill(0),
    lcl: Array(period).fill(0)
  }
  
  arr.slice(period).forEach((_, idx) => {
    const subset = arr.slice(idx, idx + period)
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

export function rsi(arr, { period = 14 } = {}) {
  const gains = [0], loss = [0], rsis = [0]
  let prevAvgG, prevAvgL, avgG, avgL, gSubset, lSubset
  return arr.map((_, idx) => {
    if (idx === 0) return 0
    const delta = arr[idx] - arr[idx-1]
    if (delta > 0) {
      gains.push(delta)
      loss.push(0)
    } else {
      gains.push(0)
      loss.push(delta)
    }
    
    if (idx >= period) {      
      if (idx - period === 0) {
        gSubset = gains.slice(idx - period, idx)
        lSubset = loss.slice(idx - period, idx)
        avgG = mean(gSubset)
        avgL = mean(lSubset)
      } else {
        avgG = ((avgG * (period - 1)) + gains[idx]) / period
        avgL = ((avgL * (period - 1)) + loss[idx]) / period
      }
      
      if (avgL === 0) return 100

      return 100 - (100 / ( 1 + Math.abs(avgG / avgL)))
    } else {
      return 0
    }
  })
}

/** @type {import('./stats').numArrToNum} */
export const sum = (arr) => arr.reduce((cum, val) => (cum += val), 0)

const Stats = { 
  deltas, 
  controlStats,
  mean,
  stddev,
  sum,
  rsi 
}

export default Object.freeze(Stats)
