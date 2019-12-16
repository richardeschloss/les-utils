import Rexter from './rexter'
import { Svc as ibm } from '@/src/rexters/ibm'

const rexters = {
  ibm
}

function LangUtils({ api = 'ibm' }) {
  if (!rexters[api]) {
    throw new Error(`svc ${api} not implemented`)
  }

  const out = rexters[api]
  /* Custom extensions could go here */
  return out
}

const { K8S_SECRET_YANDEX_TRANSLATE: YANDEX_API_KEY_BASE64 } = process.env

let YANDEX_API_KEY
if (YANDEX_API_KEY_BASE64) {
  YANDEX_API_KEY = Buffer.from(YANDEX_API_KEY_BASE64, 'base64').toString()
}

// const yandexRexter = Rexter({
//   hostname: 'translate.yandex.net'
// })

const checkEnv = {
  yandex() {
    if (!YANDEX_API_KEY) {
      throw new Error(
        'YANDEX_API_KEY undefined. Please encode as base64 and set K8S_SECRET_YANDEX_TRANSLATE \
        to that encoded value'
      )
    }
  }
}

const supportLangs = {
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

export { LangUtils }
