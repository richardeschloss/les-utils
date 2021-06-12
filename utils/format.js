import { fmtDate, isDate as isDateFn } from './datetime.js'

const unitsRegex = new RegExp(/[kKmMbB]/)
const unitsMultiplier = {
  T: 1e12,
  B: 1e9,
  M: 1e6,
  K: 1e3
}
const scaleUpUnits = ['K', 'M', 'B', 'T']

/** 
 * @type import('./format')._.preProcess
 */
function preProcess(input) {
  let out = input
  if (typeof out === 'string') {
    const mult = out.match(/[-()]/) ? -1 : 1
    out = parseFloat(out.replace(/[^0-9.]+/g, '')) * mult
  }
  return out
}

/** 
 * @type import('./format')._.abbreviateNumber
 */
const abbreviateNumber = (input) => {
  let num = input
  let unit = ''
  Object.entries(unitsMultiplier).some(([u, mult]) => {
    if (Math.abs(num) >= mult) {
      num /= mult
      unit = ` ${u}`
      return true
    }
  })
  return { num, unit }
}

/** 
 * @type import('./format')._.isCurrency
 */
function isCurrency(input, { currencySymbol }) {
  if (input.raw) {
    input.val = input.raw
  }
  if (
    typeof input !== 'object' ||
    typeof input.val !== 'number' ||
    typeof input.fmt !== 'string' ||
    (typeof input.fmt === 'string' && !input.fmt.includes(currencySymbol))
  ) {
    return false
  }
  return true
}

/** 
 * @type import('./format')._.isDate
 */
function isDate(input) {
  if (!input) return false
  if (input.raw) {
    input.val = input.raw
  }
  if (
    typeof input !== 'object' ||
    !isDateFn(input.val) ||
    typeof input.fmt !== 'string'
  ) {
    return false
  }
  input.epochTime = input.val.getTime()
  return true
}

/** 
 * @type import('./format')._.isNumber
 */
function isNumber(input) {
  if (!input) return false
  if (input.raw) {
    input.val = input.raw
  }
  if (
    typeof input !== 'object' ||
    typeof input.val !== 'number' ||
    typeof input.fmt !== 'string'
  ) {
    return false
  }
  return true
}

/** 
 * @type import('./format')._.isNumber
 */
function isLargeNumber(input) {
  if (
    typeof input !== 'object' ||
    typeof input.val !== 'number' ||
    typeof input.fmt !== 'string' ||
    !input.fmt.match(/[kKmMbB]/)
  ) {
    return false
  }
  return true
}

/**
 * @type import('./format')._.isCurrency
 */
function isLargeCurrency(input, { currencySymbol }) {
  if (input.raw) {
    input.val = input.raw
  }
  if (
    typeof input !== 'object' ||
    typeof input.val !== 'number' ||
    typeof input.fmt !== 'string' ||
    (typeof input.fmt === 'string' && !input.fmt.includes(currencySymbol)) ||
    !input.fmt.match(/[kKmMbB]/)
  ) {
    return false
  }
  
  return true
}

/**
 * @type import('./format')._.isPercentage
 */
function isPercentage(input) {
  if (input.raw) {
    input.val = input.raw
  }
  if (
    input === undefined ||
    input === null ||
    typeof input !== 'object' ||
    typeof input.val !== 'number' ||
    typeof input.fmt !== 'string' ||
    (typeof input.fmt === 'string' && !input.fmt.includes('%'))
  ) {
    return false
  }
  return true
}

/* Exports */
/** @type import('./format').currency */
export function currency(input = 0, opts = {}) {
  const {
    locale = 'en-us',
    currency = 'USD',
    currencySymbol = '$'
  } = opts
  if (isCurrency(input, { currencySymbol })) return input
  const out = {
    val: (input.val !== null && input.val !== undefined)
      ? input.val 
      : input,
    fmt: ''
  }
  if (out.val) {
    if (typeof out.val === 'string') {
      let mult = 1
      /** @type {string|RegExpMatchArray} */
      let sign = out.val.match(/([-+])/)
      if (out.val.match(/[()]/)) {
        sign = '-'
      }

      if (sign && sign[0] === '-') {
        mult = -1
      }
      out.val = out.val.replace(/[$,()-]/g, '')
      out.val *= mult
    } 
    out.fmt = out.val.toLocaleString(locale, {
      style: 'currency',
      currency
    })
  } else {
    out.val = 0
    out.fmt = '$0.00'
  }
  return out
}

/** @type import('./format').dateT */
export function date(input = Date.now(), opts = {}) {
  const { dateFmt, scale = 1 } = opts
  if (isDate(input)) return input

  const out = {
    val: (input !== null && input.val !== undefined && input.val !== null)
      ? input.val 
      : input,
    fmt: '',
    epochTime: NaN
  }
  
  if (out.val !== undefined && out.val !== null) {
    if (typeof out.val === 'string') {
      out.val = (new Date(out.val))
    }
    if (scale && typeof out.val === 'number') {
      out.val *= scale
    }
    out.val = new Date(out.val)
    out.fmt = fmtDate(out.val, dateFmt)
    out.epochTime = out.val.getTime()
  } else {
    out.val = 'InvalidDate'
    out.fmt = out.val
  }
  return out
}

/** @type import('./format').largeCurrency */
export function largeCurrency(input = 0, opts = {}) {
  const {
    locale = 'en-us',
    currency = 'USD',
    currencySymbol = '$'
  } = opts
  if (isLargeCurrency(input, { currencySymbol })) return input
  const out = {
    val: (input.val !== undefined && input.val !== null)
      ? input.val 
      : parseFloat(input),
    fmt: ''
  }
  if (out.val) {
    const { num, unit } = abbreviateNumber(out.val)
    out.fmt =
      num.toLocaleString(locale, {
        style: 'currency',
        currency
      }) + unit
  } else {
    out.val = 0
    out.fmt = '$0.00'
  }
  return out
}

/** @type import('./format').largeNumber */
export function largeNumber(input, opts = {}) {
  const { precision = 2, locale = 'en-us', scale = 1 } = opts
  if (isLargeNumber(input)) return input
  const out = {
    val: preProcess(input),
    fmt: ''
  }
  out.val *= scale
  const { num, unit } = abbreviateNumber(out.val)
  out.fmt =
    num.toLocaleString(locale, { maximumFractionDigits: precision }) + unit
  return out
}

/** @type import('./format').numberT */
export function number(input = 0, opts = {}) {
  const { locale = 'en-us', precision } = opts
  if (isNumber(input)) return input
  const out = {
    val: (input.val !== undefined && input.val !== null)
      ? input.val 
      : preProcess(input),
    fmt: ''
  }

  if (out.val) {
    if (typeof input === 'string' && input.match(unitsRegex)) {
      scaleUpUnits.forEach((unit) => {
        if (input.toUpperCase().includes(unit)) {
          out.val *= unitsMultiplier[unit]
          input = input.replace(/\s*[A-Z]/, ` ${unit}`)
        }
      })
      out.fmt = input
    } else {
      out.fmt = out.val.toLocaleString(locale, { minimumFractionDigits: precision })
    }
  } else {
    out.val = 0
    out.fmt = '0'
  }
  return out
}

/** @type import('./format').stringT */
export function string(input) {
  if (typeof input === 'string') {
    return input
  } else {
    return input.toString()
  }
}

/** @type import('./format').percentage */
export function percentage(input = 0, opts = {}) {
  const { precision = 2, scale = 1 } = opts
  if (isPercentage(input)) return input
  const out = {}
  if (input.val !== undefined && input.val !== null) {
    out.val = input.val
  } else if (typeof input === 'object') {
    out.val = 0
  } else {
    out.val = input
  }
  out.fmt = ''
  
  if (out.val) {
    if (typeof input === 'string') {
      out.val = parseFloat(out.val.replace(/[A-z]+/, '0').replace(/%/, ''))
      if (input.match('%')) {
        out.val /= 100
      }
    }

    out.val *= scale
    out.fmt = (out.val * 100).toFixed(precision) + '%'
  } else {
    out.val = 0
  }
  out.fmt = (out.val * 100).toFixed(precision) + '%'

  return out
}

const FormatUtils = {
  currency,
  date,
  largeCurrency,
  largeNumber,
  number,
  percentage,
  string
}

export default Object.freeze(FormatUtils)

