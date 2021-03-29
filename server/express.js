import express from 'express'
import bodyParser from 'body-parser'
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express()
app.use(bodyParser.json())

app.use(express.static(__dirname + '/static'))
app
.get('/hello', (req, res) => {
  console.log('req.params', req.query, req.params)
  res.send({ msg: 'ok' })
})
.get('/hello/:id', (req, res) => {
  console.log('req.params', req.query, req.params)
  res.send({ msg: 'ok' })
})
.post('/testData', (req, res) => {
  console.log('ok got data...', req.body)
  res.send({ msg: 'rxd!!' })
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
        resolve();
      })
      app.on('error', reject)
    })
  },
  stop() {
    server.close()
  }
})

export default Svc