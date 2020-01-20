/* Constants */
export const msPerDay = 86400000

/* Functions */
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

export function days(nDays) {
  return nDays * msPerDay
}

export function durationStr(startDate, endDate) {
  const deltaDays = (endDate - startDate) / msPerDay
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
    .replace('yyyy', fullYear)
    .replace('hh', ('0' + hours).slice(-2))
    .replace('mm', ('0' + minutes).slice(-2))
    .replace('a', amPm)
}

export function mergeDateTime(date, time) {
  const returnDate = new Date(date)
  const returnTime = new Date(time)
  returnDate.setHours(returnTime.getHours())
  returnDate.setMinutes(returnTime.getMinutes())
  return returnDate
}

export function nextQuarter() {
  const today = new Date()
  let nextQuarterMonth = 3 * (Math.floor(today.getMonth() / 3) + 1)
  let nextYear = today.getFullYear()
  if (nextQuarterMonth === 12) {
    nextQuarterMonth = 0
    nextYear++
  }
  return new Date(nextYear, nextQuarterMonth, 1)
}

export function nextYear() {
  const nextYear = new Date(this)
  nextYear.setFullYear(this.getFullYear() + 1)
  return nextYear
}

export function priorMonth() {
  const today = new Date()
  let priorMonthVal = today.getMonth() - 1
  if (priorMonthVal < 0) {
    priorMonthVal = 11
  }
  const priorMonth = new Date().setMonth(priorMonthVal)
  return new Date(priorMonth)
}

export function priorNYears(n) {
  const today = new Date()
  const priorYears = new Date().setYear(today.getFullYear() - n)
  return new Date(priorYears)
}

export function priorNYearStr(n, format) {
  const priorYears = priorNYears(n)
  return fmtDate(priorYears, format)
}

export const priorYear = () => {
  return new Date(today().setYear(today().getFullYear() - 1))
}

export const today = () => new Date()

export function todayStr(format) {
  return fmtDate(today(), format)
}

export const DateTimeUtils = Object.freeze({
  today,
  priorYear,
  msPerDay,
  changeDateFmt,
  days,
  durationStr,
  fmtDate,
  mergeDateTime,
  nextQuarter,
  nextYear,
  priorMonth,
  priorNYears,
  priorNYearStr,
  todayStr
})
