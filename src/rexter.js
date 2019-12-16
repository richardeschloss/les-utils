/* eslint-disable prefer-promise-reject-errors */
import fs from 'fs'
import http, { Agent } from 'http'
import https, { Agent as HttpsAgent } from 'https'
import bl from 'bl'
import { parse as parseCookie } from 'cookie'
import { stringify } from 'querystring'
import { parse as urlParse } from 'url'
import { createGunzip } from 'zlib'
import { parseXML } from '@/src/string'
import { PromiseUtils } from '@/src/promises'
import Debug from 'debug'

const debug = Debug('utils:rexter')

/* Constants */
const httpAgent = new Agent({
  keepAliveMsecs: 10000,
  keepAlive: true,
  maxSockets: Infinity,
  maxFreeSockets: 256
})

const httpsAgent = new HttpsAgent({
  keepAliveMsecs: 10000,
  keepAlive: true,
  maxSockets: Infinity,
  maxFreeSockets: 256
})

const stringifiers = {
  'application/json': JSON.stringify,
  'application/x-www-form-urlencoded': stringify
}

const outputFmts = {
  json: JSON.parse,
  string: (response) => response.toString(),
  xml: parseXML
}

/* Exports */
export function checkEnv({ reqdVars = [] }) {
  reqdVars.forEach((v) => {
    if (!process.env[v]) {
      throw new Error(`${v} undefined. Please define and encode as base64`)
    }
  })
}

export default function Rexter(cfg) {
  const _cfg = Object.assign({}, cfg)
  if (_cfg.url) {
    const { hostname, port, proto, path: basePath } = urlParse(_cfg.url)
    Object.assign(_cfg, { hostname, port, proto, basePath })
  }

  const { family = 4, proto = 'https', hostname = '', port = 443, auth } = _cfg

  const agent = proto === 'https' ? httpsAgent : httpAgent
  let _cookies
  let _parsedCookies = []
  const _defaultHeaders = {
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch, br',
    'Accept-Language': 'en-US,en;q=0.8',
    Connection: 'keep-alive',
    Cookie: ''
  }

  function cacheCookies(cookies) {
    _cookies = cookies
    _parsedCookies = cookies.map((cookie) => parseCookie(cookie))
  }

  function cookiesValid() {
    let expiredCnt = 0
    const bogusMs = new Date('01/01/1971').getTime()
    _parsedCookies.forEach((cookie) => {
      if (cookie.expires) {
        const expiresMs = new Date(cookie.expires)
        if (expiresMs > bogusMs && Date.now() > expiresMs) {
          expiredCnt++
        }
      }
    })

    if (expiredCnt > 0) {
      _parsedCookies = []
    }

    return _parsedCookies.length > 0
  }

  function getCookies() {
    return _cookies
  }

  function setCookies(cookies) {
    _cookies = cookies
  }

  function downloadFile({ url, dest, notify }) {
    return new Promise((resolve) => {
      const outStream = fs.createWriteStream(dest)
      const protoObj = proto === 'https' ? https : http
      protoObj.get(url, (res) => {
        res.pipe(outStream)
        const size = parseInt(res.headers['content-length'])
        let bytesRxd = 0
        let downloadProgress = 0
        res
          .on('data', (d) => {
            bytesRxd += d.length
            downloadProgress = (bytesRxd / size) * 100
            if (notify) {
              notify({
                evt: 'setDownloadProgress',
                data: {
                  downloadProgress
                }
              })
            }
          })
          .on('end', resolve)
      })
    })
  }

  function formatResp(response, outputFmt) {
    if (outputFmts[outputFmt]) {
      return outputFmts[outputFmt](response)
    } else {
      return response
    }
  }

  function get({ path, url, options }) {
    const reqOptions = Object.assign({ path }, options)
    if (url) {
      const { pathname: path, hostname, search } = urlParse(url)
      Object.assign(reqOptions, {
        path: path + search,
        hostname,
        search,
        prependPath: false
      })
    }

    return request(reqOptions)
  }

  function post({ path, postData, ...options }) {
    const reqOptions = Object.assign(
      { path, postData, method: 'POST' },
      options
    )

    return request(reqOptions)
  }

  function request(reqOptions) {
    const {
      postData,
      prependPath = true,
      method = 'GET',
      notify,
      outputFmt,
      transform
    } = reqOptions
    let { postStr } = reqOptions
    const { basePath } = _cfg
    reqOptions.headers = Object.assign({}, _defaultHeaders, reqOptions.headers)
    const optsCopy = {
      auth,
      agent,
      family,
      hostname,
      port
    }

    const protoObj = proto === 'https' ? https : http
    Object.assign(optsCopy, reqOptions)
    Object.assign(optsCopy.headers, reqOptions.headers)
    if (_cookies) {
      optsCopy.headers.Cookie = _cookies.join(';')
    }

    if (method === 'POST') {
      if (postData) {
        if (!optsCopy.headers['Content-Type']) {
          optsCopy.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }
        const stringifier = stringifiers[optsCopy.headers['Content-Type']]
        postStr = stringifier(postData)
        optsCopy.headers['Content-Length'] = postStr.length
      } else if (postStr) {
        optsCopy.headers['Content-Length'] = postStr.length
      }
    }

    if (basePath && prependPath) {
      optsCopy.path = `${basePath}${optsCopy.path}`
    }

    return new Promise((resolve, reject) => {
      debug(
        optsCopy.agent.protocol +
          '//' +
          optsCopy.hostname +
          ':' +
          optsCopy.port +
          optsCopy.path
      )
      debug('[request] headers', optsCopy, optsCopy.headers)
      protoObj
        .request(optsCopy, (res) => {
          const { statusCode, headers } = res
          debug('[response] statusCode', statusCode)
          debug('[response] headers', headers)
          if (statusCode !== 200) {
            reject({ statusCode, headers })
            return
          }

          if (notify) {
            notify({
              evt: 'response_status',
              data: { statusCode, headers }
            })
          }

          if (headers['set-cookie']) {
            cacheCookies(headers['set-cookie'])
          }

          async function handleResp(err, response) {
            if (err) {
              reject(err)
            } else {
              let finalResp
              if (outputFmt) {
                finalResp = await formatResp(response, outputFmt)
              }

              if (transform) {
                finalResp = transform(finalResp)
              }
              resolve(finalResp)
            }
          }

          if (headers['content-encoding'] === 'gzip') {
            res.pipe(createGunzip()).pipe(bl(handleResp))
          } else {
            res.pipe(bl(handleResp))
          }
        })
        .on('error', (err) => {
          reject(err)
        })
        .end(postStr)
    })
  }

  function requestMany(info = {}) {
    const {
      iteratee = 'items',
      method,
      headers = {},
      notify,
      pathTemplate,
      postDataTemplate,
      transform,
      sequential,
      outputFmt
    } = info
    const { replaceToken = '[ITEM]' } = info

    const collection = info[iteratee]
    const reqOptions = {
      method,
      path: info.path,
      outputFmt,
      headers,
      transform
    }
    let stringifier = stringify

    if (postDataTemplate) {
      if (!reqOptions.headers['Content-Type']) {
        reqOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      }
      stringifier = stringifiers[reqOptions.headers['Content-Type']]
      reqOptions.postStrTemplate = stringifier(postDataTemplate)
      reqOptions.method = 'POST'
    }

    const batchMethod = sequential ? PromiseUtils.series : PromiseUtils.each
    return batchMethod({
      items: collection,
      handleItem(item) {
        let replaceTokenCopy = replaceToken
        if (pathTemplate) {
          reqOptions.path = pathTemplate.replace(replaceToken, item)
        }

        if (reqOptions.postStrTemplate) {
          if (
            reqOptions.headers['Content-Type'] ===
            'application/x-www-form-urlencoded'
          ) {
            replaceTokenCopy = encodeURIComponent(replaceToken)
          }
          reqOptions.postStr = reqOptions.postStrTemplate
            .replace(replaceTokenCopy, item)
            .replace(replaceTokenCopy.toLowerCase(), item.toLowerCase())
        }

        return request(reqOptions).catch((err) => {
          console.error('Error requesting item', item, err)
          return { item }
        })
      },
      notify
    })
  }

  return Object.freeze({
    cookiesValid,
    getCookies,
    setCookies,
    downloadFile,
    get,
    post,
    request,
    requestMany
  })
}
