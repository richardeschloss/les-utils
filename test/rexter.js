import { createWriteStream, existsSync, unlinkSync } from 'fs'
import ava from 'ava'
import ExpressServer from '../server/express.js'
// import { delay } from '../utils/promise.js'
import Rexter, { checkEnv } from '../utils/rexter.js'

const { serial: test, before, after } = ava
const rexter = Rexter({})

const urls = {
  csv0: 'http://localhost:3001/somefile.csv?t=12345',
  csv1: 'http://localhost:8080/somefile2.csv'
}

before('start server', async () => {
  await ExpressServer.start()
})

after('stop server', () => {
  ExpressServer.stop()
})

test('checkEnv', (t) => {
  // eslint-disable-next-line no-undef
  process.env.someAPIKey = '123'
  checkEnv(['someAPIKey'])
  t.pass()
  try {
    checkEnv(['nonExist'])
  } catch (err) {
    t.is(err.message, 'nonExist undefined. Please define. Encoding as base64 may be required')
  }
})

test('cookiesValid', async (t) => {
  t.false(rexter.cookiesValid())
  await rexter.get('http://localhost:3001/expires1yr')
  t.true(rexter.cookiesValid())
  await rexter.get('http://localhost:3001/expired', { transform: 'json'})
  t.false(rexter.cookiesValid())
})

test('get', async (t) => {
  const resp1 = await rexter.get(urls.csv0, { transform: 'csv' })
  .catch((err) => console.error(err))
  t.is(typeof resp1, 'object')
  t.is(resp1[0].hdr1, 'data1')
  t.is(resp1[0].hdr2, 'data2')
  const resp2 = await rexter.get(urls.csv0, { 
    /** @param {Buffer} r */
    transform: (r) => r.toString(),
    progress: true,
    /**
     * @param {string} evt
     * @param {any} data
     */
    notify(evt, data) {
      if (evt === 'progress') {
        console.log(data)
      }
    }
  })
  t.is(resp2, 'hdr1,hdr2\ndata1,data2')

  await rexter.get(urls.csv0, {
    dest: './server/downloads/myName.csv'
  })
  t.true(existsSync('./server/downloads/myName.csv'))
  await rexter.get(urls.csv0, {
    dest: './server/downloads/myName.csv'
  })
  t.true(existsSync('./server/downloads/myName_(1).csv'))

  await rexter.get(urls.csv0, {
    dest: createWriteStream('./server/downloads/writable.csv')
  })
  t.true(existsSync('./server/downloads/writable.csv'))

  await rexter.get('http://localhost:3001/noext', {
    dest: ''
  })
  t.true(existsSync('./noext.txt'))
  await rexter.get('http://localhost:3001/noext_noInfo', {
    dest: ''
  })
  t.true(existsSync('./noext_noInfo'))
  const files = [
    './server/downloads/myName.csv',
    './server/downloads/myName_(1).csv',
    './server/downloads/writable.csv',
    './noext.txt',
    './noext_noInfo'
  ]
  files.forEach(unlinkSync)
  
})

test('get (gzip)', async (t) => {
  const resp = await rexter.get('http://localhost:3001/gzip', {
    transform: 'string'
  })
  t.is(resp, 'some resp')
})

test('get (various status codes)', async (t) => {
  await rexter.get('http://localhost:3001/something')
  .catch((err) => t.is(err.message, 'resource not found: http://localhost:3001/something'))
  
  const resp = await rexter.get('http://localhost:3001/redirect1', { transform: 'json' })
  t.is(resp.msg, 'ok')

  await rexter.get('http://localhost:3001/redirect2')
  .catch((err) => t.is(err.message, 'too many redirects'))

  await rexter.get('http://localhost:3001/partial')
  .catch(({statusCode}) => t.is(statusCode, 210))
})

test('reqTimeout', async (t) => {
  await rexter.get('https://localhost:3001')
  .catch((err) => t.true(err.message.includes('REQUEST error at')))
  
  await rexter.get('http://localhost:3001/hanging', { reqTimeout: 500 })
  .catch((err) => t.is(err.message, 'Request timeout: url=http://localhost:3001/hanging'))
})

test('post', async (t) => {
  const postData = {
    hello: 'world'
  }
  const resp = await rexter.post(
    'http://localhost:3001/testData', 
    { 
      postData,  
      headers: {
        'Content-Type': 'application/json'
      },
      transform: 'json' 
    }
  )
  t.is(resp.msg, 'rxd!!')
  const resp2 = await rexter.post(
    'http://localhost:3001/urlEncoded', 
    { 
      postData: 'key1=val1&key2=val2',  
      transform: 'string' 
    }
  )
  t.is(resp2, 'ok')
})

test('batch', async (t) => {
  const r = await rexter.batch({
    paths: '/somefile.:id.txt',
    tokens: [{id: 1}, {id: 2}],
    hostname: 'localhost',
    port: 3001,
    protocol: 'http:',
    transform: 'string'
  })
  t.is(r[0], 'This is some file ** 1 ** ')
  t.is(r[1], 'This is some file ** 2 ** ')

  const rexter2 = Rexter({ hostname: 'localhost', port: '3001', protocol: 'http:'})
  const r2 = await rexter2.batch({
    paths: '/somefile.:id.txt',
    tokens: [{id: 1}, {id: 2}],
    transform: 'string'
  })
  t.is(r2[0], 'This is some file ** 1 ** ')
  t.is(r2[1], 'This is some file ** 2 ** ')

  const [ r3 ] = await rexter2.batch({
    paths: '/somefile.csv',
    transform: 'csv'
  })
  t.is(r3[0].hdr1, 'data1')

  const [ r4 ] = await rexter.batch({
    paths: ['http://localhost:3001/somefile.csv'],
    transform: 'csv'
  })
  t.is(r4[0].hdr1, 'data1')
})