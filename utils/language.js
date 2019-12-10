import Rexter from '@/utils/rexter'

const yandexRexter = Rexter({
  hostname: 'translate.yandex.net'
})
const { K8S_SECRET_YANDEX_TRANSLATE: API_KEY_BASE64 } = process.env
const API_KEY = Buffer.from(API_KEY_BASE64, 'base64').toString()

function getSupportedLangs({ ui = 'en' }) {
  const postData = {
    key: API_KEY,
    ui
  }
  return yandexRexter.post({
    path: '/api/v1.5/tr.json/getLangs',
    postData,
    outputFmt: 'json'
  })
}

function translateText({ text, lang }) {
  const postData = {
    key: API_KEY,
    text,
    lang
  }
  return yandexRexter.post({
    path: '/api/v1.5/tr.json/translate',
    postData,
    outputFmt: 'json'
  })
}

export { getSupportedLangs, translateText }
