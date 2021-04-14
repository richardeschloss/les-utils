export const msPerDay = 86400000
export const today = () => new Date()

/** @type {import("./datetime").isDate} */
export const isDate = (input) => 
  input !== undefined &&
  input.constructor.name === 'Date' 

/** @type {import("./datetime").changeDateFmt} */
export function changeDateFmt(input, oldFmt, newFmt) {
  const yearIdx = oldFmt.match('yyyy').index
  const monthIdx = oldFmt.match('MM').index
  const dayIdx = oldFmt.match('dd').index
  const year = input.substr(yearIdx, 4)
  const month = input.substr(monthIdx, 2)
  const day = input.substr(dayIdx, 2)
  return newFmt
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
}

/** @type {import("./datetime").daysToMs} */
export const daysToMs = (nDays) => nDays * msPerDay

/** @type {import("./datetime").durationStr} */
export function durationStr(startDate, endDate) {
  const s = new Date(startDate)
  const e = new Date(endDate)
  
  const deltaDays = (e.getTime() - s.getTime()) / msPerDay
  let str = ''
  if (deltaDays < 30) {
    str = deltaDays + 'd'
  } else if (deltaDays >= 30 && deltaDays < 365) {
    const deltaMonths = Math.round(deltaDays / 30)
    str = deltaMonths + 'm'
    if (deltaMonths === 12) {
      str = '1y'
    }
  } else {
    const deltaYears = Math.round(deltaDays / 365)
    str = deltaYears + 'y'
  }
  return str
}

/** @type {import("./datetime").fmtDate} */
export function fmtDate(input, dateFmt = 'MM/dd/yyyy') {
  const date = new Date(input)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const fullYear = date.getFullYear()
  const Hours = date.getHours()
  const hours = Hours % 12 || 12
  const minutes = date.getMinutes()
  const amPm = Hours >= 12 ? 'PM' : 'AM'

  return dateFmt
    .replace('MM', ('0' + month).slice(-2))
    .replace('dd', ('0' + day).slice(-2))
    .replace('yyyy', fullYear.toString())
    .replace('hh', ('0' + hours).slice(-2))
    .replace('mm', ('0' + minutes).slice(-2))
    .replace('a', amPm)
}

/** @type {import("./datetime").mergeDateTime} */
export function mergeDateTime(date, time) {
  const returnDate = new Date(date)
  const returnTime = new Date(time)
  returnDate.setHours(returnTime.getHours())
  returnDate.setMinutes(returnTime.getMinutes())
  return returnDate
}

/** @type {import("./datetime").nTimeFn} */
export function nextNYears(n = 1, fromDate = new Date()) {
  const nextYear = new Date(fromDate)
  nextYear.setFullYear(nextYear.getFullYear() + n)
  return nextYear
}

/** @type {import("./datetime").nTimeFnStr} */
export const nextNYearStr = (n, fromDate = new Date(), format) => 
  fmtDate(nextNYears(n, fromDate), format)

/** @type {import("./datetime").nTimeFn} */
export function prevNYears(n = 1, fromDate = new Date()) {
  const prevYears = new Date(fromDate)
  prevYears.setFullYear(prevYears.getFullYear() - n)
  return prevYears
}

/** @type {import("./datetime").nTimeFnStr} */
export const prevNYearStr = (n, fromDate = new Date(), format) => 
  fmtDate(prevNYears(n, fromDate), format)

/** @type {import("./datetime").nTimeFn} */
export function nextNMonths(n = 1, fromDate = new Date()) {
  const _fromDate = new Date(fromDate)
  let nextMonthVal = _fromDate.getMonth() + n
  let nextYear = _fromDate.getFullYear()
  if (nextMonthVal === 12) {
    nextMonthVal = 0
    nextYear++
  }
  return new Date(nextYear, nextMonthVal, _fromDate.getDate())
}

/** @type {import("./datetime").nTimeFn} */
export function prevNMonths(n = 1, fromDate = new Date()) {
  const _fromDate = new Date(fromDate)
  let prevMonthVal = _fromDate.getMonth() - n
  let prevYear = _fromDate.getFullYear()
  if (prevMonthVal < 0) {
    prevMonthVal = 11
    prevYear--
  }
  return new Date(prevYear, prevMonthVal, _fromDate.getDate())
}

/** @type {import("./datetime").nTimeFn} */
export function nextNQuarters(n = 1, fromDate = new Date()) {
  const _fromDate = new Date(fromDate)
  let nextQuarterMonth = 3 * (Math.floor(_fromDate.getMonth() / 3) + n)
  let nextYear = _fromDate.getFullYear()
  
  if (nextQuarterMonth >= 12) {
    nextQuarterMonth = nextQuarterMonth - 12
    nextYear++
  }
  return new Date(nextYear, nextQuarterMonth, 15)
}

/** @type {import("./datetime").nTimeFn} */
export function prevNQuarters(n = 1, fromDate = new Date()) {
  const _fromDate = new Date(fromDate)
  let prevQuarterMonth = 3 * (Math.floor(_fromDate.getMonth() / 3) - n)
  let prevYear = _fromDate.getFullYear()
  
  if (prevQuarterMonth < 0) {
    prevQuarterMonth = prevQuarterMonth + 12
    prevYear--
  }
  return new Date(prevYear, prevQuarterMonth, 15)
}

/** @type {import("./datetime").todayStr} */
export const todayStr = (format) => fmtDate(today(), format)

const DateTimeUtils = Object.freeze({
  isDate,
  msPerDay,
  today,
  changeDateFmt,
  daysToMs,
  durationStr,
  fmtDate,
  mergeDateTime,
  nextNQuarters,
  nextNMonths,
  nextNYears,
  nextNYearStr,
  prevNQuarters,
  prevNMonths,
  prevNYears,
  prevNYearStr,
  todayStr
})

export default DateTimeUtils
