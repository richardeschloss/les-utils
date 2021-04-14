import express from 'express'
import bodyParser from 'body-parser'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { createGzip } from 'zlib'
import { nextNYearStr } from '../utils/datetime.js'
import { Readable } from 'stream'

// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(__dirname + '/static', {
  setHeaders(res) {
    res.setHeader('set-cookie', 'abc=123;')
  }
}))
app
.get('/hello', (req, res) => {
  console.log('req.params', req.query, req.params)
  res.send({ msg: 'ok' })
})
.get('/hello/:id', (req, res) => {
  console.log('req.params', req.query, req.params)
  res.send({ msg: 'ok' })
})
.get('/expires1yr', (_, res) => {
  res.setHeader('set-cookie', `expires=${nextNYearStr()}`)
  res.send({msg: 'ok'})
})
.get('/expired', (_, res) => {
  res.setHeader('set-cookie', 'expires=01/01/1990')
  res.send({msg: 'ok'})
})
.get('/redirect1', (_, res) => {
  res.status(301)
  res.setHeader('location', 'http://localhost:3001/hello')
  res.send('redirect...')
})
.get('/redirect2', (_, res) => {
  res.status(301)
  res.setHeader('location', 'http://localhost:3001/redirect2')
  res.send('redirect...')
})
.get('/partial', (_, res) => {
  res.status(210)
  res.send('some err')
})
.get('/hanging', () => {})
.get('/gzip', (_, res) => {
  res.setHeader('content-encoding', 'gzip')
  Readable.from('some resp')
    .pipe(createGzip()).pipe(res)
})
.get('/noext', (_, res) => {
  res.setHeader('content-type', 'text/plain')
  res.send('some data with no ext...figure it out yourself')
})
.get('/noext_noInfo', (_, res) => {
  res.setHeader('content-type', 'application/x-www-form-urlencoded')
  res.send('some data with no ext...figure it out yourself')
})
.post('/testData', (req, res) => {
  // json body
  console.log('ok got data...', req.body)
  res.send({ msg: 'rxd!!' })
})
.post('/urlEncoded', (req, res) => {
  // url encoded body
  console.log('here', req.body)
  res.send('ok')
})

let server
const Svc = Object.freeze({
  /**
   * @param {number} port
   * @default 3001 
   */
  start(port = 3001) {
    return new Promise((resolve, reject) => {
      server = app.listen(port, () => {
        console.log(`listening at ${port}`)
        resolve()
      })
      app.on('error', reject)
    })
  },
  stop() {
    server.close()
  }
})

export default Svc