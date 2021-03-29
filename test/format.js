import test from 'ava'
import {
  currency,
  date,
  largeCurrency,
  largeNumber,
  number,
  percentage
} from '../utils/format.js'
import { fmtDate } from '../utils/datetime.js'

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
    { val: 0, fmt: '$0.00' }
  ]
  
  exp.forEach(({ val, fmt }, idx) => {
    t.is(val, tests[idx].val)
    t.is(fmt, tests[idx].fmt)
  })
})

test('date', (t) => {
  const tests = [
    date(new Date('01/02/2003')),
    date({ val: 0 }),
    date({ val: new Date('01/02/2003'), fmt: '01/02/2003' }),
    date({ val: '01/02/2003' }),
    date({ raw: new Date('01/02/2003') }),
    date(null)
  ]
  const exp = [
    { val: new Date('01/02/2003'), fmt: '01/02/2003' },
    { val: new Date(0), fmt: '12/31/1969' },
    { val: new Date('01/02/2003'), fmt: '01/02/2003' },
    { val: new Date('01/02/2003'), fmt: '01/02/2003' },
    { val: new Date('01/02/2003'), fmt: '01/02/2003' },
    { val: 'InvalidDate', fmt: 'InvalidDate' }
  ]

  exp.forEach(({ val, fmt }, idx) => {
    if (typeof (val) === 'string') {
      // @ts-ignore
      t.is(val, tests[idx].val)
    } else {
      t.is(val.getTime(), tests[idx].val.getTime())
      t.is(val.getTime(), tests[idx].epochTime)
    }
    t.is(fmt, tests[idx].fmt)
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
    largeCurrency()
  ]
  const exp = [
    { val: 4320022222, fmt: '$4.32 B' },
    { val: 3210987, fmt: '$3.21 M'},
    { val: 100, fmt: '$100.00'},
    { val: 200, fmt: '$200.00'},
    { val: 3000, fmt: '$3K'},
    { val: 0, fmt: '$0.00'}
    
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
    largeNumber('-1234')  
  ]
  const exp = [
    { val: 4320022222, fmt: '4.32 B' },
    { val: 1234, fmt: '1.23 K' },
    { val: -1234, fmt: '-1.23 K' }
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
    { val: 0, fmt: '0.00%' }
  ]
  exp.forEach(({ fmt }, idx) => {
    t.is(fmt, tests[idx].fmt)
  })
})
