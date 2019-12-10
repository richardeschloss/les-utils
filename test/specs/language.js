import test from 'ava'
import { getSupportedLangs, translateText } from '@/utils'

test.only('ENV Var check', (t) => {
  console.log('somevar is', process.env.SOMEVAR)
  t.is(process.env.SOMEVAR, 'abc123456')
})

test('Translate text', async (t) => {
  const resp = await translateText({
    text: 'Hello world!',
    lang: 'en-es'
  })
  const { text, lang } = resp
  t.is(text[0], 'Hola mundo!')
  t.is(lang, 'en-es')
})

test('Supported languages', async (t) => {
  const resp = await getSupportedLangs({})
  const { dirs, langs } = resp
  t.true(dirs.length > 0)
  t.is(langs.en, 'English')
})
