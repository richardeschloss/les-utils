"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.camelCase = camelCase;
exports.startCase = startCase;
exports.parseXML = parseXML;
exports.StringUtils = void 0;

var _xml2js = require("xml2js");

function camelCase(str) {
  return str.replace(/\s(.)/g, function ($1) {
    return $1.toUpperCase();
  }).replace(/\s/g, '').replace(/^(.)/, function ($1) {
    return $1.toLowerCase();
  }).replace(/[^\w\s]/gi, '');
}

function startCase(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function parseXML(xml) {
  return new Promise((resolve, reject) => {
    (0, _xml2js.parseString)(xml, (err, json) => {
      if (err) {
        reject(err);
      } else {
        resolve(json);
      }
    });
  });
}

const StringUtils = {
  camelCase,
  startCase,
  parseXML
};
exports.StringUtils = StringUtils;