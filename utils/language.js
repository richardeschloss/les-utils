import Rexter from '@/utils/rexter'

const yandexRexter = Rexter({
  hostname: 'translate.yandex.net'
})
const { API_KEY } = process.env

function getSupportedLangs({ ui = 'en' }) {
  const postData = {
    key: API_KEY,
    ui
  }
  return yandexRexter.post({
    path: '/api/v1.5/tr.json/getLangs',
    postData
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
    postData
  })
}

export { getSupportedLangs, translateText }
