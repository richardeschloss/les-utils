import { parse as UrlParse } from 'url'
import Rexter from './rexter'
import { promiseEach, promiseSeries } from './promises'

const {
  K8S_SECRET_YANDEX_TRANSLATE: YANDEX_API_KEY_BASE64,
  K8S_SECRET_WATSON_TRANSLATE: WATSON_API_KEY_BASE64,
  K8S_SECRET_WATSON_ENDPOINT1: WATSON_ENDPOINT1_BASE64
} = process.env

let YANDEX_API_KEY, WATSON_API_KEY, WATSON_ENDPOINT
if (YANDEX_API_KEY_BASE64) {
  YANDEX_API_KEY = Buffer.from(YANDEX_API_KEY_BASE64, 'base64').toString()
}

if (WATSON_API_KEY_BASE64 && WATSON_ENDPOINT1_BASE64) {
  WATSON_API_KEY = Buffer.from(WATSON_API_KEY_BASE64, 'base64').toString()
  WATSON_ENDPOINT = Buffer.from(WATSON_ENDPOINT1_BASE64, 'base64').toString()
}

const yandexRexter = Rexter({
  hostname: 'translate.yandex.net'
})

const ibmUrlParsed = UrlParse(WATSON_ENDPOINT)
const ibmRexter = Rexter({
  hostname: ibmUrlParsed.hostname
})

const identifiableLanguages = {
  ibm({}) {
    return ibmRexter.get({
      url: `${WATSON_ENDPOINT}/v3/identifiable_languages?version=2018-05-01`,
      options: {
        auth: `apikey:${WATSON_API_KEY}`,
        outputFmt: 'json'
      }
    })
  }
}

const supportLangs = {
  ibm({ src = 'en' }) {
    console.log('getting supported langs from IBM')
    return ibmRexter.get({
      url: `${WATSON_ENDPOINT}/v3/models?version=2018-05-01`,
      options: {
        auth: `apikey:${WATSON_API_KEY}`,
        outputFmt: 'json',
        transform: ({ models }) =>
          models
            .filter(({ source }) => source === src)
            .map(({ target }) => target)
      }
    })
  },
  yandex({ ui = 'en' }) {
    console.log('getting supported langs from Yandex')
    const postData = {
      key: YANDEX_API_KEY,
      ui
    }
    return yandexRexter.post({
      path: '/api/v1.5/tr.json/getLangs',
      postData,
      outputFmt: 'json'
    })
  }
}

const translate = {
  ibm({ text, lang, src = 'en' }) {
    const postData = {
      text, // Can be [String] or String
      model_id: `${src}-${lang}`
    }
    return ibmRexter
      .post({
        path: `${ibmUrlParsed.path}/v3/translate?version=2018-05-01`,
        postData,
        auth: `apikey:${WATSON_API_KEY}`,
        headers: {
          'Content-Type': 'application/json'
        },
        outputFmt: 'json',
        transform: ({ translations }) => translations
      })
      .catch(() => {
        throw new Error(`Error translating to lang ${lang}.`)
      })
  },
  yandex({ text, lang }) {
    const postData = {
      key: YANDEX_API_KEY,
      text,
      lang
    }
    return yandexRexter.post({
      path: '/api/v1.5/tr.json/translate',
      postData,
      outputFmt: 'json'
    })
  }
}

const translateBatch = {
  async ibm({ texts = [], langs = [], notify, requestStyle = 'each' }) {
    if (langs === 'all') {
      langs = await getSupportedLangs({})
    }
    console.log('translating for langs', langs)
    const failedLangs = []
    const promiseFn = requestStyle === 'each' ? promiseEach : promiseSeries
    return promiseFn({
      items: langs,
      handleItem: (lang) =>
        translate
          .ibm({ text: texts, lang })
          .then((resp) => resp.map(({ translation }) => translation)),
      notify({ data }) {
        const { err, item: lang, resp: result } = data
        if (err) {
          console.error(err.message)
          failedLangs.push(lang)
        } else {
          notify({ lang, result })
        }
      },
      transform: (out) => ({ out, failedLangs })
    })
  }
}

function getSupportedLangs({ svc = 'ibm' }) {
  return supportLangs[svc]({})
}

function translateMany({ svc = 'ibm', ...args }) {
  return translateBatch[svc](args)
}

function translateText({ svc = 'ibm', ...args }) {
  return translate[svc](args)
}

export {
  getSupportedLangs,
  identifiableLanguages,
  translateMany,
  translateText
}
