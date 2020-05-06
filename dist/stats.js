"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const Stats = {
  σ(dataArr) {
    return Math.sqrt(Stats.sum(dataArr.map(i => (i - Stats.mean(dataArr)) ** 2)) / dataArr.length);
  },

  controlStats(arr, {
    period = 14,
    factor = 2
  }) {
    const out = {
      mean: Array(period).fill(0),
      ucl: Array(period).fill(0),
      lcl: Array(period).fill(0)
    };
    arr.slice(period).forEach((elm, idx) => {
      const subset = arr.slice(idx - period, idx);
      const subsetStdev = Stats.σ(subset);
      const mean = Stats.mean(subset);
      const ucl = mean + factor * subsetStdev;
      const lcl = mean - factor * subsetStdev;
      out.mean.push(mean);
      out.ucl.push(ucl);
      out.lcl.push(lcl);
    });
    return out;
  },

  dailyIncreases(arr) {
    return arr.map((c, idx) => idx > 0 ? c - arr[idx - 1] : 0);
  },

  mean(dataArr) {
    return Stats.sum(dataArr) / dataArr.length;
  },

  sum(dataArr) {
    return dataArr.reduce((cum, val) => cum += val, 0);
  }

};
var _default = Stats;
exports.default = _default;