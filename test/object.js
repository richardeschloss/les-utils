import test from 'ava'
import { flip, omit, pick, prune } from '../utils/object.js'

const testObj = {
  symbol: 'AAA',
  name: 'Abby'
}

test('flip', (t) => {
  const obj = {
    a: '11.22',
    b: 'Some Str',
    c: '33.2'
  }
  const flipped = flip(obj)
  Object.entries(obj).forEach(([key, val]) => {
    t.is(key, flipped[val])
  })
})

test('omit', (t) => {
  const omitted = omit(testObj, ['symbol'])
  t.falsy(omitted.symbol)
  t.is(omitted.name, testObj.name)
})

test('pick', (t) => {
  const picked = pick(testObj, ['symbol'])
  t.is(picked.symbol, testObj.symbol)
  t.falsy(picked.name)
})

test('prune', (t) => {
  const orig = {
    a: 111,
    b: null,
    c: 333
  }
  const pruned = prune(orig)
  Object.entries(orig).forEach(([key, val]) => {
    if (val) {
      t.is(pruned[key], val)
    } else {
      t.true(pruned[key] === undefined)
    }
  })
})
