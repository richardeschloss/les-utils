"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LangUtils = LangUtils;

var _ibm = require("./rexters/ibm");

var _yandex = require("./rexters/yandex");

const rexters = {
  ibm: _ibm.Svc,
  yandex: _yandex.Svc
};

function LangUtils({
  api = 'ibm'
}) {
  if (!rexters[api]) {
    throw new Error(`svc ${api} not implemented`);
  }

  const out = rexters[api];
  /* Custom extensions could go here */

  return out;
}