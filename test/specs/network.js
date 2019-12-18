import { serial as test } from 'ava'
import { NetUtils } from '@/src/network'
import { createServer } from 'http'

test('Find free port (default range)', async (t) => {
  const freePort = await NetUtils.findFreePort({})
  t.true(freePort >= 8000 && freePort <= 9000)
})

test('Find free port (default range, 8000 used)', (t) => {
  const port = 8000
  return new Promise((resolve, reject) => {
    const server = createServer({})
      .listen(port)
      .on('listening', async () => {
        console.log('listening at', server.address().port)
        const freePort = await NetUtils.findFreePort({})
        console.log('freePort', freePort)
        const isPortTaken = await NetUtils.portTaken({ port })
        console.log('isPortTaken', isPortTaken)
        t.true(isPortTaken)
        t.not(freePort, port)
        t.true(freePort >= 8000 && freePort <= 9000)
        resolve()
      })
      .on('error', (err) => {
        console.error('err occurred', err)
        reject(err)
      })
  })
})
