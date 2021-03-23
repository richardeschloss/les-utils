import { existsSync } from 'fs'
import ava from 'ava'
import ExpressServer from '../server/express.js'
import { delay } from '../utils/promise.js'
import Rexter, { checkEnv } from '../utils/rexter.js'

const { serial: test, before, after } = ava
const rexter = Rexter({})

const urls = {
  csv0: 'http://localhost:3001/somefile.csv?t=12345',
  csv1: 'http://localhost:8080/somefile2.csv'
}

before('start server', async (t) => {
  await ExpressServer.start()
})

after('stop server', (t) => {
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

test('get', async (t) => {
  const resp1 = await rexter.get(urls.csv0, { transform: 'csv' })
  .catch((err) => console.error(err))
  t.is(typeof resp1, 'object')
  t.is(resp1[0].hdr1, 'data1')
  t.is(resp1[0].hdr2, 'data2')
  const resp2 = await rexter.get(urls.csv0, { transform: 'string' })
  t.is(resp2, 'hdr1,hdr2\ndata1,data2')
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
  console.log('resp', resp)
  t.pass()
})
