import test from 'ava'
import { existsSync, unlinkSync } from 'fs'
import Rexter from '@/src/rexter'

test('getFile (no listener)', async (t) => { // Also update les! (if it relied on getFile)
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
    options: {
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, sdch, br',
        'Accept-Language': 'en-US,en;q=0.8',
        Connection: 'keep-alive'
      }
    },
    notify({ evt, data }) {
      // console.log(evt, data)
      if (evt === 'setDownloadProgress') {
        t.true(data > 0)
      } else if (evt === 'res') {
        console.log('res headers', data.headers)
      }
    }
  }
  await rexter.getFile(testOpts)
  t.true(existsSync(dest))
  unlinkSync(dest)
})
