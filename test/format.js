import test from 'ava'
import {
  currency,
  date,
  largeCurrency,
  largeNumber,
  number,
  percentage,
  string
} from '../utils/format.js'

test('currency', (t) => {
  const tests = [
    currency(2.55),
    currency({ raw: -10 }),
    currency({ val: -10, fmt: '-$10' }),
    currency({ val: -11, fmt: -11 }),
    currency({ val: '12' }), 
    currency({ val: '-13' }), 
    currency({ val: '(14)' }),
    currency(0),
    currency({}),
    // @ts-ignore
    currency()
  ]
  const exp = [
    { val: 2.55, fmt: '$2.55' },
    { val: -10, fmt: '-$10.00' },
    { val: -10, fmt: '-$10' },
    { val: -11, fmt: '-$11.00' },
    { val: 12, fmt: '$12.00' },
    { val: -13, fmt: '-$13.00' },
    { val: -14, fmt: '-$14.00' },
    { val: 0, fmt: '$0.00' },
    { val: 0, fmt: '$0.00' },
    { val: 0, fmt: '$0.00' }
  ]
  
  exp.forEach(({ val, fmt }, idx) => {
    t.is(val, tests[idx].val)
    t.is(fmt, tests[idx].fmt)
  })
})

test('date', (t) => {
  const tests = [
    date('Tue, 29 Jun 2021 16:00:00 +0000'),
    date(new Date('01/02/2003')),
    date({ val: 0 }),
    date({ val: new Date('01/02/2003'), fmt: '01/02/2003' }),
    date({ val: '01/02/2003' }),
    date({ raw: new Date('01/02/2003') }),
    date(null),
    date({})
  ]
  
  const exp = [
    { val: new Date('Tue, 29 Jun 2021 16:00:00 +0000'), fmt: '06/29/2021' },
    { val: new Date('01/02/2003'), fmt: '01/02/2003' },
    { val: new Date(0), fmt: '12/31/1969' },
    { val: new Date('01/02/2003'), fmt: '01/02/2003' },
    { val: new Date('01/02/2003'), fmt: '01/02/2003' },
    { val: new Date('01/02/2003'), fmt: '01/02/2003' },
    { val: new Date(NaN), fmt: '--' },
    { val: new Date(NaN), fmt: '--' }
  ]

  exp.forEach(({ val, fmt }, idx) => {
    // @ts-ignore
    if (isNaN(val.getTime())) {
      t.true(isNaN(tests[idx].val.getTime()))
      t.is(fmt, tests[idx].fmt)
    } else {
      t.is(val.getTime(), tests[idx].val.getTime())
      t.is(val.getTime(), tests[idx].epochTime)
      if (val.getTime() === 0) {
        t.true(['12/31/1969', '01/01/1970'].includes(fmt))
      } else {
        t.is(fmt, tests[idx].fmt)
      }
    }
  })
  t.pass()
})

test('largeCurrency', (t) => {
  const tests = [
    largeCurrency('4320022222'),
    largeCurrency('3210987'),
    largeCurrency({ raw: 100 }),
    largeCurrency({ val: 200, fmt: '$200.00' }),
    largeCurrency({ val: 3000, fmt: '$3K'}),
    // @ts-ignore
    largeCurrency(),
    largeCurrency('2,123')
  ]
  const exp = [
    { val: 4320022222, fmt: '$4.32 B' },
    { val: 3210987, fmt: '$3.21 M'},
    { val: 100, fmt: '$100.00'},
    { val: 200, fmt: '$200.00'},
    { val: 3000, fmt: '$3K'},
    { val: 0, fmt: '$0.00'},
    { val: 2123, fmt: '$2.12 K'}
    
  ]
  exp.forEach(({ val, fmt }, idx) => {
    t.is(val, tests[idx].val)
    t.is(fmt, tests[idx].fmt)
  })
})

test('largeNumber', (t) => {
  const tests = [
    largeNumber('4320022222'),
    largeNumber({ val: 1234, fmt: '1.23 K' }),
    largeNumber('-1234'),
    largeNumber({ raw: 75427776, fmt: '75.428M', longFmt: '75,427,776' })  
  ]
  const exp = [
    { val: 4320022222, fmt: '4.32 B' },
    { val: 1234, fmt: '1.23 K' },
    { val: -1234, fmt: '-1.23 K' },
    { val: 75427776, fmt: '75.428M' }
  ]
  exp.forEach(({ val, fmt }, idx) => {
    t.is(val, tests[idx].val)
    t.is(fmt, tests[idx].fmt)
  })
})

test('number', (t) => {
  const tests = [
    number('$1433222'),
    number({ val: 1433222, fmt: '1,433,222' }),
    number('120 K'),
    number({ val: 100 }),
    number({ raw: 200 }),
    
    // @ts-ignore
    number()
    

  ]
  const exp = [
    { val: 1433222, fmt: '1,433,222' },
    { val: 1433222, fmt: '1,433,222' },
    { val: 120000, fmt: '120 K'},
    { val: 100, fmt: '100'},
    { val: 200, fmt: '200'},

    { val: 0, fmt: '0'}
  ]
  exp.forEach(({ val, fmt }, idx) => {
    t.is(val, tests[idx].val)
    t.is(fmt, tests[idx].fmt)
  })
})

test('percentage', (t) => {
  const tests = [
    percentage('0.225', { precision: 1, scale: 1 }),
    percentage('12.3%'),
    percentage('12.3', { scale: 0.01 }),
    percentage({ raw: 0.11 }),
    percentage({ val: 0.11, fmt: '11.00%' }),
    percentage({ val: 0.21 }),
    percentage({}),
    // @ts-ignore
    percentage()
  ]
  
  const exp = [
    { val: 0.225, fmt: '22.5%' },
    { val: 0.123, fmt: '12.30%' },
    { val: 0.123, fmt: '12.30%' },
    { val: 0.11, fmt: '11.00%' },
    { val: 0.11, fmt: '11.00%' },
    { val: 0.21, fmt: '21.00%' },
    { val: 0, fmt: '0.00%' },
    { val: 0, fmt: '0.00%' }
  ]
  exp.forEach(({ fmt }, idx) => {
    t.is(fmt, tests[idx].fmt)
  })
})

test('string', (t) => {
  t.is(string(111), '111')
  t.is(string('111'), '111')
})