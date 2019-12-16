"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LangUtils = LangUtils;

var _url = require("url");

var _rexter = _interopRequireDefault(require("./rexter"));

var _promises = require("./promises");

var _ibm = require("./rexters/ibm");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rexters = {
  ibm: _ibm.Svc
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

const LangUtilsX = {
  run({
    svc = 'ibm',
    method = '',
    ...args
  }) {
    if (!rexters[svc]) {
      console.log(`svc ${svc} not supported. Please try ${Object.keys(rexters)}`);
      return;
    }

    if (!rexters[svc][method]) {
      console.log(`svc ${svc} does not support or implemement method ${method}.\
        Please try another svc or supported methods ${rexters[svc].supportedMethods}`);
      return;
    }

    return rexters[svc][method](args);
  }

};
const {
  K8S_SECRET_YANDEX_TRANSLATE: YANDEX_API_KEY_BASE64,
  K8S_SECRET_WATSON_TRANSLATE: WATSON_API_KEY_BASE64,
  K8S_SECRET_WATSON_ENDPOINT1: WATSON_ENDPOINT1_BASE64
} = process.env;
let YANDEX_API_KEY, WATSON_API_KEY, WATSON_ENDPOINT;

if (YANDEX_API_KEY_BASE64) {
  YANDEX_API_KEY = Buffer.from(YANDEX_API_KEY_BASE64, 'base64').toString();
}

if (WATSON_API_KEY_BASE64 && WATSON_ENDPOINT1_BASE64) {
  WATSON_API_KEY = Buffer.from(WATSON_API_KEY_BASE64, 'base64').toString();
  WATSON_ENDPOINT = Buffer.from(WATSON_ENDPOINT1_BASE64, 'base64').toString();
}

const yandexRexter = (0, _rexter.default)({
  hostname: 'translate.yandex.net'
});
let ibmUrlParsed = {};
let ibmRexter = {};

if (WATSON_ENDPOINT) {
  ibmUrlParsed = (0, _url.parse)(WATSON_ENDPOINT);
  ibmRexter = (0, _rexter.default)({
    hostname: ibmUrlParsed.hostname
  });
}

const checkEnv = {
  // ibm() {
  //   if (!WATSON_ENDPOINT) {
  //     throw new Error(
  //       'WATSON_ENDPOINT undefined. Please encode as base64 and set K8S_SECRET_WATSON_ENDPOINT1 \
  //       to that encoded value'
  //     )
  //   }
  //   if (!WATSON_API_KEY) {
  //     throw new Error(
  //       'WATSON_API_KEY undefined. Please encode as base64 and set K8S_SECRET_WATSON_TRANSLATE \
  //       to that encoded value'
  //     )
  //   }
  // },
  yandex() {
    if (!YANDEX_API_KEY) {
      throw new Error('YANDEX_API_KEY undefined. Please encode as base64 and set K8S_SECRET_YANDEX_TRANSLATE \
        to that encoded value');
    }
  }

}; // const identifiableLanguages = {
//   ibm() {
//     checkEnv.ibm()
//     return ibmRexter.get({
//       url: `${WATSON_ENDPOINT}/v3/identifiable_languages?version=2018-05-01`,
//       options: {
//         auth: `apikey:${WATSON_API_KEY}`,
//         outputFmt: 'json'
//       }
//     })
//   }
// }

const supportLangs = {
  // ibm({ src = 'en' }) {
  //   console.log('getting supported langs from IBM')
  //   return ibmRexter.get({
  //     url: `${WATSON_ENDPOINT}/v3/models?version=2018-05-01`,
  //     options: {
  //       auth: `apikey:${WATSON_API_KEY}`,
  //       outputFmt: 'json',
  //       transform: ({ models }) =>
  //         models
  //           .filter(({ source }) => source === src)
  //           .map(({ target }) => target)
  //     }
  //   })
  // },
  yandex({
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
      outputFmt: 'json'
    });
  }

};
const translate = {
  // ibm({ text, lang, src = 'en' }) {
  //   const postData = {
  //     text, // Can be [String] or String
  //     model_id: `${src}-${lang}`
  //   }
  //   return ibmRexter
  //     .post({
  //       path: `${ibmUrlParsed.path}/v3/translate?version=2018-05-01`,
  //       postData,
  //       auth: `apikey:${WATSON_API_KEY}`,
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       outputFmt: 'json',
  //       transform: ({ translations }) => translations
  //     })
  //     .catch(() => {
  //       throw new Error(`Error translating to lang ${lang}.`)
  //     })
  // },
  yandex({
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
      outputFmt: 'json'
    });
  }

};
const translateBatch = {
  async ibm({
    texts = [],
    langs = [],
    notify,
    requestStyle = 'each'
  }) {
    if (langs === 'all') {
      langs = await getSupportedLangs({});
    }

    console.log('translating for langs', langs);
    const failedLangs = [];
    const promiseFn = requestStyle === 'each' ? _promises.promiseEach : _promises.promiseSeries;
    return promiseFn({
      items: langs,
      handleItem: lang => translate.ibm({
        text: texts,
        lang
      }).then(resp => resp.map(({
        translation
      }) => translation)),

      notify({
        data
      }) {
        const {
          err,
          item: lang,
          resp: result
        } = data;

        if (err) {
          console.error(err.message);
          failedLangs.push(lang);
        } else {
          notify({
            lang,
            result
          });
        }
      },

      transform: out => ({
        out,
        failedLangs
      })
    });
  }

};

function getSupportedLangs({
  svc = 'ibm'
}) {// checkEnv[svc]()
  // return supportLangs[svc]({})
}

function translateMany({
  svc = 'ibm',
  ...args
}) {
  checkEnv[svc]();
  return translateBatch[svc](args);
}

function translateText({
  svc = 'ibm',
  ...args
}) {
  checkEnv[svc]();
  return translate[svc](args);
}