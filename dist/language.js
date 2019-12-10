"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSupportedLangs = getSupportedLangs;
exports.translateText = translateText;
exports.default = void 0;

var _rexter = _interopRequireDefault(require("./rexter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const yandexRexter = (0, _rexter.default)({
  hostname: 'translate.yandex.net'
});
const {
  K8S_SECRET_YANDEX_TRANSLATE: API_KEY_BASE64
} = process.env;
let API_KEY;

if (API_KEY_BASE64) {
  API_KEY = Buffer.from(API_KEY_BASE64, 'base64').toString();
}

function getSupportedLangs({
  ui = 'en'
}) {
  const postData = {
    key: API_KEY,
    ui
  };
  return yandexRexter.post({
    path: '/api/v1.5/tr.json/getLangs',
    postData,
    outputFmt: 'json'
  });
}

function translateText({
  text,
  lang
}) {
  const postData = {
    key: API_KEY,
    text,
    lang
  };
  return yandexRexter.post({
    path: '/api/v1.5/tr.json/translate',
    postData,
    outputFmt: 'json'
  });
}

var _default = {
  getSupportedLangs,
  translateText
};
exports.default = _default;