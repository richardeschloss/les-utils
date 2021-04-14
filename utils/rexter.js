import Debug from 'debug'
import { createWriteStream, readdirSync, mkdirSync } from 'fs'
import http from 'http'
import https from 'https'
import { parse as pParse, resolve as pResolve } from 'path'
import { pipeline as pipelineAsync, Writable } from 'stream'
import { promisify } from 'util'
import { createGunzip } from 'zlib'
import { URL } from 'url'
import ProgressBar from 'progress'
import { Buffer } from 'buffer'
import csvParse from 'csv-parse/lib/sync.js'
import { stringify as qStringify } from 'querystring'
import { parse as parseCookie } from 'cookie'
import { parseXML } from '../utils/string.js'

const debug = Debug('rexter')

const pipeline = promisify(pipelineAsync)

/** @type {import('./rexter')._.transformers} */
const transformers = Object.freeze({
  csv: (resp) => csvParse(resp, { columns: true }),
  json: JSON.parse,
  string: (resp) => resp.toString(),
  xml: parseXML
})

const dfltOpts = {
  protocol: 'https:',
  headers: {
    'Accept-Encoding': 'gzip, deflate, sdch, br',
    'Cookie': '' // TBD (added 03/22/2021)
  }
}

const stringifiers = {
  'application/json': JSON.stringify,
  'application/x-www-form-urlencoded': qStringify
}

/** @type {import('./rexter').checkEnv} */
export function checkEnv(reqdVars = []) {
  reqdVars.forEach((v) => {
    // eslint-disable-next-line no-undef
    if (!process.env[v]) {
      throw new Error(`${v} undefined. Please define. Encoding as base64 may be required`)
    }
  })
}

/** @type {import('./rexter')._.urlInstToObj} */
const urlInstToObj = (urlInst) => {
  // @ts-ignore
  return Object.keys(urlInst.__proto__)
    .reduce((obj, key) => {
      if (typeof urlInst[key] !== 'function') {
        obj[key] = urlInst[key]
      }
      return obj
    }, {})
}

const extMap = {
  'text/plain': '.txt',
  'text/html': '.html',
  'application/json': '.json',
  'video/mp4': '.mp4',
  'audio/mp4': '.mp4'
}

/** @type {import('./rexter')._.handleResp}  */
async function handleResp(res, { 
  dest, 
  locals = {},
  notify,
  progress,
  reqPath,
  transform,
  writeOptions = {}
}) {
  locals.res = res
  if (notify) {
    notify('res', res)
  }
  const { 
    'content-type': contentType, 
    'content-length': byteLength,
    'content-encoding': contentEncoding
  } = res.headers
  
  const total = parseInt(byteLength)
  let bar
  locals.bytesRxd = 0
  
  if (progress && byteLength) {
    bar = new ProgressBar('  downloading [:bar] :rate/bps :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total
    })
  }
  
  res.on('data', 
    /** @param {Buffer} d */
    (d) => {
    // locals.data = d
    locals.bytesRxd += d.length
    if (notify) {
      notify('data', d)
      if (byteLength) {
        if (progress) {
          bar.tick(d.length)
        }
        notify('progress', locals.bytesRxd / total * 100)
      }
    }
  })
  
  const buf = []
  let writable

  if (dest === undefined) {
    // if dest not specified, buffer response (memory)
    writable = new Writable({
      write(chunk, encoding, callback) {
        buf.push(chunk)
        callback()
      }
    })
  } else if (typeof dest === 'string') {
    // If provided dest is a string...
    let { name: fName, ext } = pParse(reqPath)
    let destDir
    if (!dest) { // If it's falsy, i.e., empty string, build from reqPath
      if (ext === '') {
        ext = extMap[contentType.split(';')[0]] || ''
      }
      dest = `${fName}${ext}`
      destDir = pResolve(pParse(dest).dir)
    } else {
      // if dest is defined, first mkdir if it doesn't exist
      // mkdir if necessary...
      const { dir, name } = pParse(dest)
      destDir = pResolve(dir)
      fName = name
      mkdirSync(destDir, { recursive: true })
    }

    /** @type {object} [options] */
    // If 'a' not set, then auto increment dest.
    const { flags } = writeOptions

    if (flags !== 'a') {
      const cnt = readdirSync(destDir)
      .filter((f) => f.match(fName))
      .length

      if (cnt > 0) {
        const { dir, name, ext } = pParse(dest)
        dest = pResolve(dir, `${name}_(${cnt})${ext}`)
      }
    }
    
    if (!locals.output) {
      locals.output = dest
      console.log('saving to', locals.output)
    }
    writable = createWriteStream(locals.output, writeOptions)
  } else {
    writable = dest
  }
  locals.outStream = writable
  
  const streams = [res]
  if (contentEncoding === 'gzip') {
    // @ts-ignore
    streams.push(createGunzip())
  }
  streams.push(writable)
  // @ts-ignore
  await pipeline(...streams)

  if (!dest) {
    const resp = Buffer.concat(buf)
    if (typeof (transform) === 'function') {
      return await transform(resp)
    } else if (transformers[transform]) {
      return await transformers[transform](resp)
    } else {
      return resp
    } 
  } 
}

/** @type {import('./rexter')._.parseTemplate}  */
function parseTemplate(template, tokens) {
  if (!tokens || tokens.length === 0) return
  return tokens.map((t) => {
    return Object.entries(t)
      .reduce((str, [k, v]) => {
        return str.replace(`:${k}`, v)
      }, template)
  })
}

/** @type {import('./rexter')._.parsePaths}  */
function parsePaths(paths) {
  return paths.map((p) => {
    const out = { path: p }
    if (p.startsWith('http')) {
      const urlObj = new URL(p)
      out.path = urlObj.pathname
      out.hostname = urlObj.hostname
      out.protocol = urlObj.protocol
      out.port = urlObj.port
    }
    return out
  })  
}

/** @type {import('./rexter')._.parsePostDataTemplate}  */
// function parsePostDataTemplate(postData, tokens) {
//   const template = JSON.stringify(postData)
//   return tokens
//     .map((t) => {
//       return Object.entries(t)
//         .reduce((str, [k, v]) => {
//           return str.replace(`:${k}`, v)
//         }, template)
//     })
// }

/** @type {import('./rexter').Rexter}  */
function Rexter(cfg = {}) {
  const { hostname, protocol, port } = cfg
  let _cookies, _parsedCookies = []

  /** @type {import('./rexter')._.cacheCookies} */
  function cacheCookies(cookies) {
    _cookies = cookies
    _parsedCookies = cookies.map((cookie) => parseCookie(cookie))
  }
   
  return Object.freeze({
    cookiesValid() {
      let expiredCnt = 0
      const bogusMs = new Date('01/01/1971').getTime()
      _parsedCookies.forEach((cookie) => {
        if (cookie.expires) {
          const expiresMs = new Date(cookie.expires).getTime()
          if (expiresMs > bogusMs && Date.now() > expiresMs) {
            expiredCnt++
          }
        }
      })
  
      if (expiredCnt > 0) {
        _parsedCookies = []
      }
  
      return _parsedCookies.length > 0
    },

    get(url, options) {
      debug(`rexter.get: ${url}`)
      const urlObj = urlInstToObj(new URL(url))
      return this.request({        
        path: urlObj.pathname + urlObj.search,
        ...urlObj,
        ...options 
      })
    },

    post(url, options) {
      debug(`rexter.post: ${url}`, options.postData)
      options.method = 'POST'
      
      const urlObj = urlInstToObj(new URL(url))
      return this.request({
        path: urlObj.pathname + urlObj.search,
        ...urlObj,
        ...options   
      })
    },
  
    request(allOpts = {}) {
      const { 
        dest,
        locals = {},
        notify, 
        postData, 
        reqTimeout, 
        transform,
        progress,
        writeOptions,
        redirectLimit = 3, 
        ...reqOptions 
      } = allOpts
      let { redirectCnt = 0 } = allOpts 
      return new Promise((resolve, reject) => {
        const mergedOpts = { hostname, ...dfltOpts, ...reqOptions }
        const proto = mergedOpts.protocol === 'https:' ? https : http
        const fullUrl = `${mergedOpts.protocol}//${mergedOpts.hostname}:${mergedOpts.port}${mergedOpts.path}`
        if (_cookies) {
          mergedOpts.headers.Cookie = _cookies.join(';')
        }

        if (postData) mergedOpts.method = 'POST'
        
        let postStr
        if (mergedOpts.method === 'POST') { 
          if (!mergedOpts.headers['Content-Type']) {
            mergedOpts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
          }
          const stringifier = stringifiers[mergedOpts.headers['Content-Type']]
          postStr = typeof postData !== 'string'
            ? stringifier(postData)
            : postData
          mergedOpts.headers['Content-Length'] = postStr.length
          debug('postData', postData)
          debug('postStr', postStr)
        } else {
          delete mergedOpts.headers['Content-Length']
        }
        debug(`rexter.request: ${mergedOpts.protocol}//${mergedOpts.hostname}${mergedOpts.path}`)
        debug('reqOptions', mergedOpts)
        
        const req = proto.request(
          mergedOpts,
          async (res) => {
          debug('RESP status', res.statusCode)
          debug('RESP headers', res.headers)
          // TBD: handle resp headers
          if (res.headers['set-cookie']) {
            cacheCookies(res.headers['set-cookie'])
          }

          // TBD: handle status code 
          if (res.statusCode === 404) {
            reject(new Error('resource not found: ' + fullUrl))
          }

          // if (res.statusCode === 403) {
          //   return handleResp(res, {
          //     transform: 'string'
          //   })
          //   .then(reject)
          // }
          
          if (res.statusCode === 301) {
            const redirect = res.headers.location
            console.log(`${fullUrl} redirecting to: ${redirect}`)
            redirectCnt++
            if (redirectCnt < redirectLimit) {
              const urlObj = urlInstToObj(new URL(redirect))
              const resp = await this.request({
                ...allOpts,
                ...urlObj,
                path: urlObj.pathname,
                redirectCnt
              }).catch(reject)
              redirectCnt = 0
              resolve(resp) 
            } else {
              reject(new Error('too many redirects'))
            }
          }

          if (res.statusCode !== 200 
           && res.statusCode !== 206 ) {
            const { statusCode, headers } = res
            reject({ statusCode, headers })
          }

          handleResp(res, {
            dest,
            locals,
            notify, 
            transform,
            progress,
            reqPath: mergedOpts.path, // was: mergedOpts.pathname,
            writeOptions  
          })
          .then(resolve)
          .catch(reject)
        })

        if (mergedOpts.method === 'POST') {
          req.write(postStr)
        }
        
        req.on('error', (err) => reject(new Error(`REQUEST error at ${fullUrl} (${err.message})`)))
        req.end()
        if (reqTimeout) {
          req.setTimeout(
            reqTimeout, 
            () => reject(new Error(`Request timeout: url=${fullUrl}`))
          )
        }
        locals.req = req
      })
    },

    batch(options) { 
      const ctx = this
      const { paths, tokens, ...rest } = options
      const _protocol = protocol, _port = port
      let reqPaths
      if (typeof paths === 'string') {
        reqPaths = parseTemplate(paths, tokens) || [paths]
        // TBD: works, but needs test coverage...
        // if (postData) { // destruct postData from options
        //   const postStrs = parsePostDataTemplate(postData, tokens)
        //   const p = postStrs.map((data) => {
        //     return ctx.post(reqPaths[0], {
        //       postData: data,
        //       headers: {
        //         'Content-Type': 'application/json'
        //       },
        //       ...rest 
        //     })
        //   })
        //   return Promise.all(p)
        // }
      } else {
        reqPaths = paths
      }
      
      const p = parsePaths(reqPaths)
        .map(({ path, hostname, protocol, port }) => {
          const reqOpts = { 
            path, 
            protocol: _protocol, 
            port: _port, 
            ...rest 
          }
          if (hostname) {
            reqOpts.hostname = hostname
            reqOpts.protocol = protocol
            reqOpts.port = port
          }
          return ctx.request(reqOpts)
        })
      return Promise.all(p)
    }
  })
}

export default Rexter