import ava from 'ava'
import NetUtils from '../utils/network.js'
import { createServer } from 'http'

const { serial: test } = ava

test('Find free port (default range)', async (t) => {
  const freePort = await NetUtils.findFreePort({})
  t.true(freePort >= 8000 && freePort <= 9000)
})

test('Find free port (default range, 8000 used)', (t) => {
  const port = 8000
  return new Promise((resolve, reject) => {
    createServer({})
      .listen(port)
      .on('listening', async () => {
        const freePort = await NetUtils.findFreePort({})
        const isPortTaken = await NetUtils.portTaken({ port })
        t.true(isPortTaken)
        t.not(freePort, port)
        t.true(freePort >= 8000 && freePort <= 9000)
        resolve()
      })
      .on('error', (err) => {
        console.error('err occurred', err)
        t.fail()
        reject(err)
      })
  })
})
