
/** @type {import('./promise').delay} */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  
/** @type {import('./promise').batchFn} */
export function each(opts) {
  const { items = [], groupBy, handleItem, transform, notify } = opts
  const nItems = items.length
  let doneCnt = 0
  let out = {}
  return new Promise((resolve) => {
    if (doneCnt === nItems) resolve(out)
    items.forEach(async (item, itemIdx) => {
      const resp =  await handleItem(item, itemIdx).catch((err) => {
        if (notify) {
          notify({
            evt: 'promiseEachErr',
            data: {
              err,
              item
            }
          })
        }
      })

      if (groupBy) {
        out[item[groupBy]] = resp
      } else if (typeof item === 'string') {
        out[item] = resp
      } else {
        out[itemIdx] = resp
      }

      doneCnt++
      if (notify) {
        notify({
          evt: 'promiseEachProgress',
          data: {
            resp,
            item
          },
          progress: doneCnt / nItems
        })
      }
      if (doneCnt === nItems) {
        if (transform) out = transform(out)
        resolve(out)
      }
    })
  })
}

/** @type {import('./promise').batchFn} */
export function series(opts) {
  const { items = [], groupBy, handleItem, transform, notify } = opts
  let doneCnt = 0
  const nItems = items.length
  let out = {}
  return new Promise((resolve) => {
    function checkDone() {
      if (doneCnt === nItems) {
        if (transform) out = transform(out)
        resolve(out)
      } else {
        handleNext()
      }
    }

    async function handleNext() {
      const itemIdx = doneCnt
      const item = items[itemIdx]
      const resp = await handleItem(item, itemIdx).catch((err) => {
        if (notify) {
          notify({
            evt: 'promiseSeriesErr',
            data: {
              err,
              item
            }
          })
        }
      })

      if (groupBy) {
        out[item[groupBy]] = resp
      } else if (typeof item === 'string') {
        out[item] = resp
      } else {
        out[itemIdx] = resp
      }

      doneCnt++
      if (notify) {
        notify({
          evt: 'promiseEachProgress',
          data: { resp, item },
          progress: doneCnt / nItems
        })
      }

      checkDone()
    }

    checkDone()
  })
}

const PromiseUtils = { delay, each, series }

export default Object.freeze(PromiseUtils)
