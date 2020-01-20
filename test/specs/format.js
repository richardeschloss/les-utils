import test from 'ava'
import {
  currency,
  date,
  largeCurrency,
  largeNumber,
  number,
  percentage
} from '@/src/format'

test('currency', (t) => {
  const c = currency(2.55)
  const c2 = currency(5.33, { outputFmt: 'fmt' })
  t.is(c.val, 2.55)
  t.is(c.fmt, '$2.55')
  t.is(c2, '$5.33')
})

test('date', (t) => {
  const d = new Date('01/02/2003')
  const dateObj = date(d)
  const dateObj2 = date(new Date('02/01/2019'), { outputFmt: 'fmt' })
  t.is(dateObj.val.getTime(), d.getTime())
  t.is(dateObj.fmt, '01/02/2003')
  t.is(dateObj2, '02/01/2019')
})

test('largeCurrency', (t) => {
  const l = largeCurrency('4320022222')
  const l2 = largeCurrency('3210987', { outputFmt: 'fmt' })
  t.is(l.val, 4320022222)
  t.is(l.fmt, '$4.32 B')
  t.is(l2, '$3.21 M')
})

test('largeNumber', (t) => {
  const l = largeNumber('4320022222')
  t.is(l.val, 4320022222)
  t.is(l.fmt, '4.32 B')
})

test('number', (t) => {
  const n = number('$1433222')
  const n2 = number('$21833222', { outputFmt: 'fmt' })
  t.is(n.val, 1433222)
  t.is(n.fmt, '1,433,222')
  t.is(n2, '21,833,222')
})

test('percentage', (t) => {
  const p = percentage('0.225', { precision: 1, scale: 100 })
  const p2 = percentage('12.3', { outputFmt: 'fmt' })
  t.is(p.val, 22.5)
  t.is(p.fmt, '22.5%')
  t.is(p2, '12.30%')
})
