"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.omit = omit;
exports.pick = pick;
exports.upsert = upsert;
exports.ArrayUtils = void 0;

function omit(arr, keys) {
  return arr.map(obj => {
    return Object.entries(obj).filter(([key]) => !keys.includes(key)).reduce((obj, [key, val]) => Object.assign(obj, {
      [key]: val
    }), {});
  });
}

function pick(arr, keys) {
  return arr.map(obj => {
    return Object.entries(obj).filter(([key]) => keys.includes(key)).reduce((obj, [key, val]) => Object.assign(obj, {
      [key]: val
    }), {});
  });
}

function upsert({
  arr = [],
  obj = {},
  keyBy = 'symbol'
}) {
  const fnd = arr.find(o => o[keyBy] === obj[keyBy]);

  if (fnd) {
    Object.assign(fnd, obj);
  } else {
    arr.push(obj);
  }
}

const ArrayUtils = Object.freeze({
  omit,
  pick,
  upsert
});
exports.ArrayUtils = ArrayUtils;