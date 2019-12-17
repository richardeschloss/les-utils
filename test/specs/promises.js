import test from 'ava'
import { PromiseUtils } from '@/src/promises'

test('.each (items undefined)', async (t) => {
  const resp = await PromiseUtils.each({})
  t.is(JSON.stringify(resp), '{}')
})

test('.each (success, groupBy)', async (t) => {
  const items = [
    { label: 'item1', delay: 100 },
    { label: 'item2', delay: 150 }
  ]
  const resp = await PromiseUtils.each({
    groupBy: 'label',
    items,
    async handleItem(item) {
      await PromiseUtils.delay(item.delay)
      return 'ok'
    }
  })
  items.forEach((item) => {
    t.is(resp[item.label], 'ok')
  })
})

test('.each (success, items are strings)', async (t) => {
  const items = ['item1', 'item2']
  const resp = await PromiseUtils.each({
    items,
    async handleItem() {
      await PromiseUtils.delay(100)
      return 'ok'
    }
  })
  items.forEach((item) => {
    t.is(resp[item], 'ok')
  })
})

test('.each (success, items are not strings)', async (t) => {
  const items = [
    { label: 'item1', delay: 100 },
    { label: 'item2', delay: 150 }
  ]
  const resp = await PromiseUtils.each({
    items,
    async handleItem(item) {
      await PromiseUtils.delay(item.delay)
      return 'ok'
    }
  })
  items.forEach((item, idx) => {
    t.is(resp[idx], 'ok')
  })
})

test('.each (transform output)', async (t) => {
  const items = ['item1', 'item2']
  const resp = await PromiseUtils.each({
    items,
    async handleItem() {
      await PromiseUtils.delay(100)
      return 'ok'
    },
    transform(out) {
      out.allDone = true
      return out
    }
  })
  items.forEach((item) => {
    t.is(resp[item], 'ok')
  })
  t.true(resp.allDone)
})

test('.each (error)', async (t) => {
  const items = [
    { label: 'item1', delay: 100 },
    { label: 'item2', delay: 150 }
  ]
  await PromiseUtils.each({
    groupBy: 'label',
    items,
    async handleItem() {
      throw new Error('err occurred')
    },
    notify({ evt, data }) {
      const { err } = data
      if (err) {
        t.is(evt, 'promiseEachErr')
        t.is(err.message, 'err occurred')
      }
    }
  })
})

test('.each (error, notify undefined)', async (t) => {
  const items = [
    { label: 'item1', delay: 100 },
    { label: 'item2', delay: 150 }
  ]
  const resp = await PromiseUtils.each({
    groupBy: 'label',
    items,
    async handleItem() {
      throw new Error('err occurred')
    }
  })
  items.forEach((item) => {
    t.falsy(resp[item.label])
  })
})

test('.series (items undefined)', async (t) => {
  const resp = await PromiseUtils.series({})
  t.is(JSON.stringify(resp), '{}')
})

test('.series (success, items are not strings)', async (t) => {
  const items = [
    { label: 'item1', delay: 100 },
    { label: 'item2', delay: 150 }
  ]
  const resp = await PromiseUtils.series({
    items,
    async handleItem(item) {
      await PromiseUtils.delay(item.delay)
      return 'ok'
    }
  })
  items.forEach((item, idx) => {
    t.is(resp[idx], 'ok')
  })
})

test('.series (success, items are strings)', async (t) => {
  const items = ['item1', 'item2']
  const resp = await PromiseUtils.series({
    items,
    async handleItem() {
      await PromiseUtils.delay(100)
      return 'ok'
    }
  })
  items.forEach((item) => {
    t.is(resp[item], 'ok')
  })
})

test('.series (success, groupBy)', async (t) => {
  const items = [
    { label: 'item1', delay: 100 },
    { label: 'item2', delay: 150 }
  ]
  const resp = await PromiseUtils.series({
    groupBy: 'label',
    items,
    async handleItem(item) {
      await PromiseUtils.delay(item.delay)
      return 'ok'
    }
  })
  items.forEach((item) => {
    t.is(resp[item.label], 'ok')
  })
})

test('.series (error)', async (t) => {
  const items = [
    { label: 'item1', delay: 100 },
    { label: 'item2', delay: 150 }
  ]
  await PromiseUtils.series({
    groupBy: 'label',
    items,
    async handleItem() {
      throw new Error('err occurred')
    },
    notify({ evt, data }) {
      const { err } = data
      if (err) {
        t.is(evt, 'promiseSeriesErr')
        t.is(err.message, 'err occurred')
      }
    }
  })
})

test('.series (error, notify undefined)', async (t) => {
  const items = [
    { label: 'item1', delay: 100 },
    { label: 'item2', delay: 150 }
  ]
  const resp = await PromiseUtils.series({
    groupBy: 'label',
    items,
    async handleItem() {
      throw new Error('err occurred')
    }
  })
  items.forEach((item) => {
    t.falsy(resp[item.label])
  })
})

test('.series (transform output)', async (t) => {
  const items = ['item1', 'item2']
  const resp = await PromiseUtils.series({
    items,
    async handleItem() {
      await PromiseUtils.delay(100)
      return 'ok'
    },
    transform(out) {
      out.allDone = true
      return out
    }
  })
  items.forEach((item) => {
    t.is(resp[item], 'ok')
  })
  t.true(resp.allDone)
})
