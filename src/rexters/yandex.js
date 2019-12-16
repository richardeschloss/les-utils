import Rexter from '@/src/rexter'

const { K8S_SECRET_YANDEX_TRANSLATE: YANDEX_API_KEY_BASE64 } = process.env

const reqdVars = ['K8S_SECRET_YANDEX_TRANSLATE']

const Svc = Object.freeze({
  checkEnv() {
    reqdVars.forEach((v) => {
      if (!process.env[v]) {
        throw new Error(`${v} undefined. Please define and encode as base64`)
      }
    })
  },
  supportedLangs({ ui = 'en' }) {
    console.log('getting supported langs from Yandex')
    const postData = {
      key: YANDEX_API_KEY,
      ui
    }
    return yandexRexter.post({
      path: '/api/v1.5/tr.json/getLangs',
      postData,
      outputFmt: 'json',
      transform: ({ dirs }) =>
        dirs.filter((i) => i.startsWith(ui)).map((i) => i.split('-')[1])
    })
  },
  translate({ text, lang }) {
    const postData = {
      key: YANDEX_API_KEY,
      text,
      lang
    }
    return yandexRexter.post({
      path: '/api/v1.5/tr.json/translate',
      postData,
      outputFmt: 'json',
      transform: ({ text }) => [{ translation: text[0] }]
    })
  },
  async translateMany({ texts = [], langs = [], notify, sequential }) {
    const { supportedLangs } = this
    if (langs === 'all') {
      langs = await supportedLangs({})
    }
    console.log('translating for langs', langs)
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
      notify({ data }) {
        const { item: lang, resp: result } = data
        notify({ lang, result })
      },
      transform: ({ text }) => text
    })
  }
})

Svc.checkEnv()

const YANDEX_API_KEY = Buffer.from(YANDEX_API_KEY_BASE64, 'base64').toString()

const yandexRexter = Rexter({
  hostname: 'translate.yandex.net'
})

export { Svc }
