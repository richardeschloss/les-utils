import test from 'ava'
import { LangUtils } from '@/src/language'

const apis = ['ibm', 'yandex']

test('Unsupported api', (t) => {
  const api = 'none'
  try {
    LangUtils({ api })
  } catch (err) {
    t.is(err.message, `svc ${api} not implemented`)
  }
})

test('Default api', (t) => {
  const svc = LangUtils({})
  t.truthy(svc)
})

apis.forEach((api) => {
  const svc = LangUtils({ api })

  test(`Supported languages (${api})`, async (t) => {
    const langs = await svc.supportedLangs({})
    console.log(`Langs (${api})`, langs, langs.length)
    t.true(langs.length > 0)
    t.pass()
  })

  if (api === 'ibm') {
    test(`Identifiable languages (${api})`, async (t) => {
      const langs = await svc.identifiableLanguages({})
      console.log(`Langs (${api})`, langs)
      t.true(langs.length > 0)
      t.pass()
    })
  }

  test(`Translate text (${api})`, async (t) => {
    const lang = 'es'
    const translations = await svc
      .translate({
        text: 'Hello world!',
        lang
      })
      .catch((err) => {
        console.error(err.message)
        t.fail()
      })

    const [{ translation }] = translations
    console.log(`Translation (${api})`, translation)
    t.true(['¡ Hola mundo!', 'Hola mundo!'].includes(translation))
    t.pass()
  })

  test(`Translate Many (${api})`, async (t) => {
    const resp = await svc.translateMany({
      sequential: true,
      texts: ['hello', 'world'],
      langs: ['fr', 'es'], // 'all'
      notify({ lang, result }) {
        console.log(lang, result)
      }
    })
    console.log('resp', resp)
    t.pass()
  })

  test(`Translate Many (${api}), parallel request`, async (t) => {
    const resp = await svc.translateMany({
      sequential: false,
      texts: ['hello', 'world'],
      langs: ['fr', 'es'], // 'all'
      notify({ lang, result }) {
        console.log(lang, result)
      }
    })
    console.log('resp', resp)
    t.pass()
  })
})
