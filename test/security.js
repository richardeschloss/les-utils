import test from 'ava'
import { generateSelfSignedCert } from '../utils/security.js'
import { unlinkSync } from 'fs'

test('Generate SSL Cert (self-signed)', async (t) => {
  const { evt, data } = await generateSelfSignedCert({})
  const { keyout, out } = data
  t.is(evt, 'createdSSLCert')
  t.is(keyout, 'localhost.key')
  t.is(out, 'localhost.crt')
  const files = ['localhost.key', 'localhost.crt']
  files.forEach((f) => unlinkSync(f))
})

test('Generate SSL Cert (self-signed w/ extras)', async (t) => {
  // NOTE: using bogus config here, so this doesn't really generate the cert.
  // Just including this to get the test coverage.
  const { evt, data } = await generateSelfSignedCert({
    configFile: './someCfg.cfg',
    extSection: 'myExt'
  })
  const { keyout, out } = data
  t.is(evt, 'createdSSLCert')
  t.is(keyout, 'localhost.key')
  t.is(out, 'localhost.crt')
})
