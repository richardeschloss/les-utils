import test from 'ava'
import { getSupportedLangs, translateText } from '@/src/language'

test('Supported languages (ibm)', async (t) => {
  const { languages: langs } = await getSupportedLangs({ svc: 'ibm' })
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
  const { translations } = await translateText({
    text: 'Hello world!',
    lang: 'es'
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
