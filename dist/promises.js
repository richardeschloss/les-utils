"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promiseEach = promiseEach;
exports.promiseSeries = promiseSeries;

function promiseEach(opts) {
  const {
    items = [],
    groupBy,
    handleItem,
    transform,
    notify
  } = opts;
  const nItems = items.length;
  let doneCnt = 0;
  let out = {};
  return new Promise((resolve, reject) => {
    items.forEach(async (item, itemIdx) => {
      const resp = await handleItem(item, itemIdx).catch(reject);

      if (groupBy) {
        out[item[groupBy]] = resp;
      } else if (typeof item === 'string') {
        out[item] = resp;
      }

      doneCnt++;

      if (notify) {
        notify({
          evt: 'promiseEachProgress',
          data: {
            progress: doneCnt / nItems,
            resp,
            item
          }
        });
      }

      if (doneCnt === nItems) {
        if (transform) out = transform(out);
        resolve(out);
      }
    });
  });
}

function promiseSeries(opts) {
  const {
    items = [],
    handleItem,
    transform,
    notify
  } = opts;
  let doneCnt = 0;
  const nItems = items.length;
  let out = {};
  return new Promise(resolve => {
    ;

    (async function handleNext() {
      const itemIdx = doneCnt;
      const item = items[itemIdx];
      const resp = await handleItem(item, itemIdx);
      out[item] = resp;
      doneCnt++;
      if (notify) notify({
        progress: doneCnt / nItems,
        resp,
        item
      });

      if (doneCnt === nItems) {
        if (transform) out = transform(out);
        resolve(out);
      } else {
        handleNext();
      }
    })();
  });
}