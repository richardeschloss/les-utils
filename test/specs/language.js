import test from 'ava'
import { getSupportedLangs, translateText, translateMany } from '@/src/language'

test('Supported languages (ibm)', async (t) => {
  const langs = await getSupportedLangs({ svc: 'ibm' })
  console.log('Langs (IBM)', langs)
  t.true(langs.length > 0)
  t.pass()
})

test('Supported languages (yandex)', async (t) => {
  const resp = await getSupportedLangs({ svc: 'yandex' })
  const { dirs, langs } = resp
  console.log('Langs (Yandex)', langs)
  t.true(dirs.length > 0)
  t.is(langs.en, 'English')
})

test('Translate text (ibm)', async (t) => {
  const lang = 'es'
  const translations = await translateText({
    text: 'Hello world!',
    lang
  }).catch((err) => {
    console.error(err.message)
    t.fail()
  })

  const [{ translation }] = translations
  console.log('Translation (ibm)', translation)
  t.is(translation, '¡ Hola mundo!')
  t.pass()
})

test('Translate text (yandex)', async (t) => {
  const resp = await translateText({
    svc: 'yandex',
    text: 'Hello world!',
    lang: 'en-es'
  })
  const { text, lang } = resp
  console.log('Translation (yandex)', text)
  t.is(text[0], 'Hola mundo!')
  t.is(lang, 'en-es')
})

test.only('Translate Many', async (t) => {
  const resp = await translateMany({
    texts: ['hello', 'world'],
    langs: ['es', 'fr', 'he', 'ar', 'af'], // 'all'
    notify({ lang, result }) {
      console.log(lang, result)
    }
  })
  console.log('resp', resp)
  t.pass()
})
