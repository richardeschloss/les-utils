import test from 'ava'
import {
  isDate,
  msPerDay,
  today,
  changeDateFmt,
  daysToMs,
  durationStr,
  fmtDate,
  mergeDateTime,
  nextNQuarters,
  prevNQuarters,
  nextNMonths,
  nextNYears,
  nextNYearStr,  
  prevNMonths,
  prevNYears,
  prevNYearStr,
  todayStr
} from '../utils/datetime.js'

const testToday = today()
const actualToday = new Date()

test('isDate', (t) => {
  t.false(isDate('not a date'))
  t.true(isDate(new Date('01/01/2011')))
})

test('today', (t) => {
  t.true(Math.abs(testToday.getTime() - actualToday.getTime()) < 100)
})

test('daysToMs', (t) => {
  t.is(daysToMs(5), 5*msPerDay)
})

test('durationStr', (t) => {
  const s1 = today(),
    e1 = today().setDate(today().getDate() + 5),
    e2 = today().setDate(today().getDate() + 35),
    e3 = today().setDate(today().getDate() + 385),
    e4 = today().setDate(today().getDate() + 355)

  t.is(durationStr(s1, e1), '5d')
  t.is(durationStr(s1, e2), '1m')
  t.is(durationStr(s1, e3), '1y')
  t.is(durationStr(s1, e4), '1y')
})

test('todayStr', (t) => {
  const str = todayStr()
  const month = actualToday.getMonth() + 1
  const day = actualToday.getDate()
  const fullYear = actualToday.getFullYear().toString()
  const fmt = 'MM/dd/yyyy'
  const expStr = fmt
    .replace('MM', ('0' + month).slice(-2))
    .replace('dd', ('0' + day).slice(-2))
    .replace('yyyy', fullYear)
  t.is(str, expStr)
})

test('changeDateFmt', (t) => {
  const out = changeDateFmt('2014-01-12', 'yyyy-MM-dd', 'MM/dd/yyyy')
  t.is(out, '01/12/2014')
})

test('fmtDate', (t) => {
  const d = new Date('01/02/2004 01:25 PM')
  const out = fmtDate(d, 'MM/dd/yyyy hh:mm a')
  const out2 = fmtDate(d, 'MM-dd-yyyy')
  t.is(out, '01/02/2004 01:25 PM')
  t.is(out2, '01-02-2004')
})

test('mergeDateTime', (t) => {
  const t1 = mergeDateTime("01/11/2021", 2*60*60*1000)
  t.is(t1.getTime(), new Date("01/12/2021 2:00:00 UTC").getTime())
})

test('nextNQuarters', (t) => {
  const _today = today().getTime()
  const q1 = nextNQuarters(1),
    q1alt = nextNQuarters(2, new Date('12/11/2021'))

  t.true(q1.getTime() > _today)
  t.is(q1alt.toLocaleDateString(), '4/15/2022')
})

test('prevNQuarters', (t) => {
  const _today = today().getTime()
  const q1 = prevNQuarters(1),
    q1alt = prevNQuarters(2, new Date('01/11/2021'))

  t.true(q1.getTime() < _today)
  t.is(q1alt.toLocaleDateString(), '7/15/2020')
})

test('nextNMonths', (t) => {
  const m1 = nextNMonths(1),
    m2 = nextNMonths(2, '12/11/2021'),
    m3 = nextNMonths(1, '12/11/2021')
  
  t.true(today().getTime() < m1.getTime())
  t.is(m2.toLocaleDateString(), '2/11/2022')
  t.is(m3.toLocaleDateString(), '1/11/2022')
})

test('prevNMonths', (t) => {
  const m1 = prevNMonths(1),
    m2 = prevNMonths(2, '12/11/2021'),
    m3 = prevNMonths(1, '1/11/2021')
  
  t.true(today().getTime() > m1.getTime())
  t.is(m2.toLocaleDateString(), '10/11/2021')
  t.is(m3.toLocaleDateString(), '12/11/2020')
})

test('nextNYears', (t) => {
  const m1 = nextNYears(1),
    m2 = nextNYears(2, '12/11/2021')
  
  t.true(today().getTime() < m1.getTime())
  t.is(m2.toLocaleDateString(), '12/11/2023')
})

test('nextNYearStr', (t) => {
  t.is(nextNYearStr(1, '11/22/2022'), '11/22/2023')
})

test('prevNYears', (t) => {
  const m1 = prevNYears(1),
    m2 = prevNYears(2, '12/11/2021')
  
  t.true(today().getTime() > m1.getTime())
  t.is(m2.toLocaleDateString(), '12/11/2019')
})

test('prevNYearStr', (t) => {
  t.is(prevNYearStr(1, '11/22/2022'), '11/22/2021')
})