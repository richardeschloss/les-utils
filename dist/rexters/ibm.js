"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Svc = void 0;

var _url = require("url");

var _rexter = _interopRequireDefault(require("../rexter"));

var _promises = require("../promises");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  K8S_SECRET_WATSON_TRANSLATE: WATSON_API_KEY_BASE64,
  K8S_SECRET_WATSON_ENDPOINT1: WATSON_ENDPOINT1_BASE64
} = process.env;
let WATSON_API_KEY, WATSON_ENDPOINT;

if (WATSON_API_KEY_BASE64 && WATSON_ENDPOINT1_BASE64) {
  WATSON_API_KEY = Buffer.from(WATSON_API_KEY_BASE64, 'base64').toString();
  WATSON_ENDPOINT = Buffer.from(WATSON_ENDPOINT1_BASE64, 'base64').toString();
}

let ibmUrlParsed = {};
let ibmRexter = {};

if (WATSON_ENDPOINT) {
  ibmUrlParsed = (0, _url.parse)(WATSON_ENDPOINT);
  ibmRexter = (0, _rexter.default)({
    hostname: ibmUrlParsed.hostname
  });
}

const reqdVars = ['WATSON_ENDPOINT', 'WATSON_API_KEY'];
const Svc = Object.freeze({
  checkEnv() {
    reqdVars.forEach(v => {
      if (!process.env[v]) {
        throw new Error(`${v} undefined. Please encode as base64 and set K8S_SECRET_${v} to that encoded value`);
      }
    });
  },

  identifiableLanguages() {
    return ibmRexter.get({
      url: `${WATSON_ENDPOINT}/v3/identifiable_languages?version=2018-05-01`,
      options: {
        auth: `apikey:${WATSON_API_KEY}`,
        outputFmt: 'json'
      }
    });
  },

  supportedLangs({
    src = 'en'
  }) {
    console.log('getting supported langs from IBM');
    return ibmRexter.get({
      url: `${WATSON_ENDPOINT}/v3/models?version=2018-05-01`,
      options: {
        auth: `apikey:${WATSON_API_KEY}`,
        outputFmt: 'json',
        transform: ({
          models
        }) => models.filter(({
          source
        }) => source === src).map(({
          target
        }) => target)
      }
    });
  },

  translate({
    text,
    lang,
    src = 'en'
  }) {
    const postData = {
      text,
      // Can be [String] or String
      model_id: `${src}-${lang}`
    };
    return ibmRexter.post({
      path: `${ibmUrlParsed.path}/v3/translate?version=2018-05-01`,
      postData,
      auth: `apikey:${WATSON_API_KEY}`,
      headers: {
        'Content-Type': 'application/json'
      },
      outputFmt: 'json',
      transform: ({
        translations
      }) => translations
    }).catch(() => {
      throw new Error(`Error translating to lang ${lang}.`);
    });
  },

  async translateMany({
    texts = [],
    langs = [],
    notify,
    requestStyle = 'each'
  }) {
    const {
      supportedLangs,
      translate
    } = this;

    if (langs === 'all') {
      langs = await supportedLangs({});
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

});
exports.Svc = Svc;
Svc.checkEnv();