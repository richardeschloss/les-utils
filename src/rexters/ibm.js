import Rexter, { checkEnv } from '@/src/rexter'

const {
  K8S_SECRET_WATSON_TRANSLATE: WATSON_API_KEY_BASE64,
  K8S_SECRET_WATSON_ENDPOINT1: WATSON_ENDPOINT1_BASE64
} = process.env

const reqdVars = ['K8S_SECRET_WATSON_TRANSLATE', 'K8S_SECRET_WATSON_ENDPOINT1']

function Svc() {
  checkEnv({ reqdVars })
  const WATSON_API_KEY = Buffer.from(WATSON_API_KEY_BASE64, 'base64').toString()
  const WATSON_ENDPOINT = Buffer.from(
    WATSON_ENDPOINT1_BASE64,
    'base64'
  ).toString()

  const ibmRexter = Rexter({
    auth: `apikey:${WATSON_API_KEY}`,
    url: WATSON_ENDPOINT
  })

  return Object.freeze({
    identifiableLanguages() {
      return ibmRexter.get({
        url: `${WATSON_ENDPOINT}/v3/identifiable_languages?version=2018-05-01`,
        options: {
          auth: `apikey:${WATSON_API_KEY}`,
          outputFmt: 'json',
          transform: ({ languages }) => languages
        }
      })
    },
    supportedLangs({ src = 'en' }) {
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
    translate({ text, lang, src = 'en' }) {
      const postData = {
        text, // Can be [String] or String
        model_id: `${src}-${lang}`
      }
      return ibmRexter
        .post({
          path: `/v3/translate?version=2018-05-01`,
          postData,
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
    async translateMany({
      texts = [],
      langs = [],
      src = 'en',
      notify,
      sequential
    }) {
      const { supportedLangs } = this
      if (langs === 'all') {
        langs = await supportedLangs({})
      }
      console.log('translating for langs', langs)
      return ibmRexter.requestMany({
        sequential,
        items: langs,
        path: `/v3/translate?version=2018-05-01`,
        postDataTemplate: {
          text: texts,
          model_id: `${src}-[ITEM]`
        },
        headers: {
          'Content-Type': 'application/json'
        },
        outputFmt: 'json',
        notify({ data }) {
          const { item: lang, resp: result } = data
          notify({ lang, result })
        },
        transform: ({ translations }) =>
          translations.map(({ translation }) => translation)
      })
    }
  })
}

export { Svc }
