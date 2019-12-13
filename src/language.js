import { parse as UrlParse } from 'url'
import Rexter from './rexter'

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

const supportLangs = {
  ibm() {
    console.log('getting supported langs from IBM')
    return ibmRexter.get({
      url: `${WATSON_ENDPOINT}/v3/identifiable_languages?version=2018-05-01`,
      options: {
        auth: `apikey:${WATSON_API_KEY}`,
        outputFmt: 'json'
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
  ibm({ text, lang, fromLang = 'en' }) {
    const postData = {
      text, //: ['Hello world'],
      model_id: `${fromLang}-${lang}`
    }
    return ibmRexter.post({
      path: `${ibmUrlParsed.path}/v3/translate?version=2018-05-01`,
      postData,
      auth: `apikey:${WATSON_API_KEY}`,
      headers: {
        'Content-Type': 'application/json'
      },
      outputFmt: 'json'
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

function getSupportedLangs({ svc = 'ibm' }) {
  return supportLangs[svc]({})
}

function translateText({ svc = 'ibm', ...args }) {
  return translate[svc](args)
}

export { getSupportedLangs, translateText }
