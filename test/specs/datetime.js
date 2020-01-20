import test from 'ava'
import { changeDateFmt, fmtDate, today, todayStr } from '@/src/datetime'

const testToday = today()
const actualToday = new Date()

test('today', (t) => {
  t.true(Math.abs(testToday.getTime() - actualToday.getTime()) < 100)
})

test('todayStr', (t) => {
  const str = todayStr()
  const month = actualToday.getMonth() + 1
  const day = actualToday.getDate()
  const fullYear = actualToday.getFullYear()
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
