function promiseEach(opts) {
  const { items = [], groupBy, handleItem, transform, notify } = opts
  const nItems = items.length
  let doneCnt = 0
  let out = {}
  return new Promise((resolve) => {
    items.forEach(async (item, itemIdx) => {
      const resp = await handleItem(item, itemIdx).catch((err) => {
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

      if (resp) {
        if (groupBy) {
          out[item[groupBy]] = resp
        } else if (typeof item === 'string') {
          out[item] = resp
        }
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

function promiseSeries(opts) {
  const { items = [], handleItem, transform, notify } = opts
  let doneCnt = 0
  const nItems = items.length
  let out = {}
  return new Promise((resolve) => {
    ;(async function handleNext() {
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
      out[item] = resp
      doneCnt++
      if (notify) {
        notify({
          evt: 'promiseEachProgress',
          data: { resp, item },
          progress: doneCnt / nItems
        })
      }

      if (doneCnt === nItems) {
        if (transform) out = transform(out)
        resolve(out)
      } else {
        handleNext()
      }
    })()
  })
}

export { promiseEach, promiseSeries }
