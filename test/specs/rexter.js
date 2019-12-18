import test from 'ava'
import { existsSync, unlinkSync } from 'fs'
import Rexter from '@/src/rexter'

test('getFile (no listener)', async (t) => {
  const rexter = Rexter({})
  const dest = '/tmp/en.json'
  const testOpts = {
    url:
      'https://raw.githubusercontent.com/richardeschloss/les/feat/i18n/locales/en.json',
    dest
  }
  await rexter.getFile(testOpts)
  t.true(existsSync(dest))
  unlinkSync(dest)
})

test('getFile  (w/ listener)', async (t) => {
  const rexter = Rexter({})
  const dest = '/tmp/en2.json'
  const testOpts = {
    url:
      'https://raw.githubusercontent.com/richardeschloss/les/feat/i18n/locales/en.json',
    dest,
    notify({ evt, data }) {
      t.is(evt, 'setDownloadProgress')
      t.true(data.downloadProgress > 0)
    }
  }
  await rexter.getFile(testOpts)
  t.true(existsSync(dest))
  unlinkSync(dest)
})
