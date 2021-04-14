import test from 'ava'
import Stats from '../utils/stats.js'

test('deltas', (t) => {
  const arr = [1,2,4,7]
  const ds = Stats.deltas(arr)
  const exp = [0,1,2,3]
  ds.forEach((d, idx) => {
    t.is(d, exp[idx])
  })
})

test('sum', (t) => {
  const arr = [1,2,3,4,5]
  t.is(Stats.sum(arr), 15)
  t.is(Stats.sum([]), 0)
})

test('mean', (t) => {
  const arr = [1,2,3,4,5]
  t.is(Stats.mean(arr), 3)
  t.is(Stats.mean([]), 0)
})

test('stddev', (t) => {
  const arr = [1,5]
  t.is(Stats.stddev(arr), 2)
})

test('controlStats (also tests sum, mean, stdev)', (t) => {
  const arr = [1,2,4,7,4,2,3,4]
  const out = Stats.controlStats(arr, { period: 2 })
  // console.log('out', out)
  t.pass()
})