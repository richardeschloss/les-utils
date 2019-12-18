import { serial as test } from 'ava'
import { NetUtils } from '@/src/network'
import { createServer } from 'http'

test('Find free port (default range)', async (t) => {
  const freePort = await NetUtils.findFreePort({})
  t.true(freePort >= 8000 && freePort <= 9000)
})

test('Find free port (default range, 8000 used)', (t) => {
  const port = 8000
  return new Promise((resolve) => {
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
  })
})
