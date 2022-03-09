import test from 'ava'
import { upsert, omit, pick, sortBy } from "../utils/array.js"

const testArr = [
  {
    symbol: 'AAA',
    name: 'Abby',
    score: {
      val: 3
    }
  },
  {
    symbol: 'BBB',
    name: 'Blah blah',
    score: {
      val: 1
    }
  },
  {
    symbol: 'CCC',
    name: 'CCC stuff',
    score: {
      val: 2
    }
  }
]

test('shall allow array props to be omitted', (t) => {
  const omitted = omit(testArr, ['symbol'])
  testArr.forEach((item, idx) => {
    t.is(omitted[idx].symbol, undefined)
    t.is(omitted[idx].name, item.name)
  })
})

test('shall allow array props to be picked', (t) => {
  const picked = pick(testArr, ['symbol'])
  testArr.forEach((item, idx) => {
    t.is(picked[idx].symbol, item.symbol)
    t.is(picked[idx].name, undefined)
  })
})

test('shall allow object to be upserted', (t) => {
  const testObj = { symbol: 'BBB', name: 'New name', data: 'new data' }
  const testObj2 = { symbol: 'DDD', name: 'Another name' }
  upsert(testArr, testObj)
  const fndIdx = testArr.findIndex(({ symbol }) => symbol === testObj.symbol)
  t.is(testArr[fndIdx].name, testObj.name)
  upsert(testArr, testObj2)
  const fndIdx2 = testArr.findIndex(({ symbol }) => symbol === testObj2.symbol)
  t.is(testArr[fndIdx2].symbol, testObj2.symbol)
  t.is(testArr[fndIdx2].name, testObj2.name)
})

test('sortBy', (t) => {
  const sorted = sortBy(testArr, 'symbol')
  t.is(sorted[0].symbol, 'AAA')
  const sorted2 = sortBy(testArr, 'score', 'val')
  t.is(sorted2[0].symbol, 'BBB')
})