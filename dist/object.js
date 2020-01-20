"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flip = flip;
exports.omit = omit;
exports.parseFloats = parseFloats;
exports.prune = prune;
exports.ObjectUtils = exports.pick = void 0;

function filter(origObj, filterBy) {
  return Object.entries(origObj).reduce((obj, [key, val]) => {
    filterBy(val, key, obj);
    return obj;
  }, {});
}

function flip(obj) {
  return Object.entries(obj).reduce((out, [key, val]) => {
    out[val] = key;
    return out;
  }, {});
}

function omit(obj, keys) {
  return Object.entries(obj).filter(([key]) => !keys.includes(key)).reduce((obj, [key, val]) => Object.assign(obj, {
    [key]: val
  }), {});
}

function parseFloats(obj, floatKeys) {
  floatKeys.forEach(flt => {
    if (obj[flt] && typeof obj[flt] === 'string') {
      obj[flt] = parseFloat(obj[flt]);
    }
  });
}

const pick = (obj, keys) => {
  return Object.entries(obj).filter(([key]) => keys.includes(key)).reduce((out, [key, val]) => Object.assign(out, {
    [key]: val
  }), {});
};

exports.pick = pick;

function prune(origObj) {
  return filter(origObj, (val, key, obj) => val && (obj[key] = val));
}

const ObjectUtils = Object.freeze({
  flip,
  omit,
  parseFloats,
  pick,
  prune
});
exports.ObjectUtils = ObjectUtils;