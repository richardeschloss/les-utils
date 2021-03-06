"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Svc = Svc;

var _rexter = _interopRequireWildcard(require("../rexter"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const {
  K8S_SECRET_YANDEX_TRANSLATE: YANDEX_API_KEY_BASE64
} = process.env;
const reqdVars = ['K8S_SECRET_YANDEX_TRANSLATE'];

function Svc() {
  (0, _rexter.checkEnv)({
    reqdVars
  });
  const YANDEX_API_KEY = Buffer.from(YANDEX_API_KEY_BASE64, 'base64').toString();
  const yandexRexter = (0, _rexter.default)({
    hostname: 'translate.yandex.net'
  });
  return Object.freeze({
    supportedLangs({
      ui = 'en'
    }) {
      console.log('getting supported langs from Yandex');
      const postData = {
        key: YANDEX_API_KEY,
        ui
      };
      return yandexRexter.post({
        path: '/api/v1.5/tr.json/getLangs',
        postData,
        outputFmt: 'json',
        transform: ({
          dirs
        }) => dirs.filter(i => i.startsWith(ui)).map(i => i.split('-')[1])
      });
    },

    translate({
      text,
      lang
    }) {
      const postData = {
        key: YANDEX_API_KEY,
        text,
        lang
      };
      return yandexRexter.post({
        path: '/api/v1.5/tr.json/translate',
        postData,
        outputFmt: 'json',
        transform: ({
          text
        }) => [{
          translation: text[0]
        }]
      });
    },

    async translateMany({
      texts = [],
      langs = [],
      notify,
      sequential
    }) {
      const {
        supportedLangs
      } = this;

      if (langs === 'all') {
        langs = await supportedLangs({});
      }

      console.log('translating for langs', langs);
      return yandexRexter.requestMany({
        sequential,
        items: langs,
        path: '/api/v1.5/tr.json/translate',
        postDataTemplate: {
          key: YANDEX_API_KEY,
          text: texts,
          lang: '[ITEM]'
        },
        outputFmt: 'json',

        notify({
          data
        }) {
          const {
            item: lang,
            resp: result
          } = data;
          notify({
            lang,
            result
          });
        },

        transform: ({
          text
        }) => text
      });
    }

  });
}