import test from 'ava'
import {
  currency,
  date,
  largeCurrency,
  largeNumber,
  number,
  percentage,
  toSchema
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

test('toSchema', (t) => {
  const mySchema = {
    myNum: { type: 'number', default: 0 },
    price: { type: 'currency' },
    saleDate: { type: 'date' },
    ytdChange: { type: 'percentage', options: { scale: 100 } },
    revenue: { type: 'largeCurrency', options: { outputFmt: 'fmt' } },
    population: { type: 'largeNumber' }
  }
  const input = {
    theirNum: '111',
    price: '12.55',
    saleDate: new Date('10/22/2012'),
    ytdChange: '0.22',
    revenue: '12388',
    population: '724177782'
  }
  const fieldMap = {
    myNum: 'theirNum'
  }

  const out = toSchema({ input, fieldMap, schema: mySchema })
  t.is(out.myNum.fmt, '111')
  t.is(out.price.fmt, '$12.55')
  t.is(out.saleDate.fmt, '10/22/2012')
  t.is(out.ytdChange.fmt, '22.00%')
  t.is(out.revenue, '$12.39 K')
  t.is(out.population.fmt, '724.18 M')
})
