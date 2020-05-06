"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkEnv = checkEnv;
exports.default = Rexter;

var _fs = _interopRequireDefault(require("fs"));

var _http = _interopRequireWildcard(require("http"));

var _https = _interopRequireWildcard(require("https"));

var _bl = _interopRequireDefault(require("bl"));

var _cookie = require("cookie");

var _querystring = require("querystring");

var _url = require("url");

var _zlib = require("zlib");

var _string = require("./string");

var _promise = require("./promise");

var _debug = _interopRequireDefault(require("debug"));

var _stream = require("stream");

var _util = require("util");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable prefer-promise-reject-errors */
const debug = (0, _debug.default)('utils:rexter');
const pipeline = (0, _util.promisify)(_stream.pipeline);
/* Constants */

const httpAgent = new _http.Agent({
  keepAliveMsecs: 10000,
  keepAlive: true,
  maxSockets: Infinity,
  maxFreeSockets: 256
});
const httpsAgent = new _https.Agent({
  keepAliveMsecs: 10000,
  keepAlive: true,
  maxSockets: Infinity,
  maxFreeSockets: 256
});
const stringifiers = {
  'application/json': JSON.stringify,
  'application/x-www-form-urlencoded': _querystring.stringify
};
const outputFmts = {
  json: JSON.parse,
  string: response => response.toString(),
  xml: _string.parseXML
};
/* Exports */

function checkEnv({
  reqdVars = []
}) {
  reqdVars.forEach(v => {
    if (!process.env[v]) {
      throw new Error(`${v} undefined. Please define and encode as base64`);
    }
  });
}

function Rexter(cfg) {
  const _cfg = Object.assign({}, cfg);

  if (_cfg.url) {
    const {
      hostname,
      port,
      proto,
      path: basePath
    } = (0, _url.parse)(_cfg.url);
    Object.assign(_cfg, {
      hostname,
      port,
      proto,
      basePath
    });
  }

  const {
    family = 4,
    proto = 'https',
    hostname = '',
    port = 443,
    auth
  } = _cfg;
  const agent = proto === 'https' ? httpsAgent : httpAgent;

  let _cookies;

  let _parsedCookies = [];
  const _defaultHeaders = {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch, br',
    'Accept-Language': 'en-US,en;q=0.8',
    Connection: 'keep-alive',
    Cookie: ''
  };

  function cacheCookies(cookies) {
    _cookies = cookies;
    _parsedCookies = cookies.map(cookie => (0, _cookie.parse)(cookie));
  }

  function cookiesValid() {
    let expiredCnt = 0;
    const bogusMs = new Date('01/01/1971').getTime();

    _parsedCookies.forEach(cookie => {
      if (cookie.expires) {
        const expiresMs = new Date(cookie.expires);

        if (expiresMs > bogusMs && Date.now() > expiresMs) {
          expiredCnt++;
        }
      }
    });

    if (expiredCnt > 0) {
      _parsedCookies = [];
    }

    return _parsedCookies.length > 0;
  }

  function getCookies() {
    return _cookies;
  }

  function setCookies(cookies) {
    _cookies = cookies;
  }

  function formatResp(response, outputFmt) {
    if (outputFmts[outputFmt]) {
      return outputFmts[outputFmt](response);
    } else {
      return response;
    }
  }

  function get({
    url = '',
    options = {},
    outputFmt,
    dest,
    writeOptions = {
      flags: 'a'
    },
    notify = () => {},
    locals = {},
    reqTimeout,
    transform
  }) {
    const {
      protocol
    } = (0, _url.parse)(url);
    const reqOptions = Object.assign({
      agent: protocol === 'https:' ? httpsAgent : httpAgent,
      family
    }, options);
    let outStream;
    let buf = [];
    let writable;

    if (dest) {
      outStream = _fs.default.createWriteStream(dest, writeOptions);
      locals.outStream = outStream;
    } else {
      writable = new _stream.Writable({
        write(chunk, encoding, callback) {
          buf.push(chunk);
          callback();
        }

      });
      locals.writable = writable;
    }

    const protoObj = protocol === 'https:' ? _https.default : _http.default;
    return new Promise((resolve, reject) => {
      const handleDone = async () => {
        if (dest) {
          outStream.close();
          resolve();
        } else {
          let finalResp = Buffer.concat(buf);

          if (outputFmt) {
            finalResp = await formatResp(finalResp, outputFmt);
          }

          if (transform) {
            finalResp = transform(finalResp);
          }

          resolve(finalResp);
        }
      };

      const handleError = err => {
        debug('get pipeline error', err);
        reject(err);
      };

      const req = protoObj.get(url, reqOptions, res => {
        locals.res = res;
        debug('statusCode', res.statusCode);
        debug('RESP headers', res.headers);
        const streams = [res];

        if (res.headers['content-encoding'] === 'gzip') {
          streams.push((0, _zlib.createGunzip)());
        }

        if (dest) {
          streams.push(outStream);
        } else {
          streams.push(writable);
        }

        pipeline(...streams).then(handleDone).catch(handleError);
        notify({
          evt: 'res'
        });
        const size = parseInt(res.headers['content-length']);
        let bytesRxd = 0;
        let downloadProgress = 0;
        res.on('data', data => {
          if (notify) {
            bytesRxd += data.length;
            debug(bytesRxd);
            locals.data = data;
            locals.bytesRxd = bytesRxd;
            notify({
              evt: 'data'
            });

            if (size) {
              downloadProgress = bytesRxd / size * 100;
              notify({
                evt: 'downloadProgress',
                data: downloadProgress
              });
            }
          }
        });
      }).on('error', err => {
        debug('REQ error', err);
        reject(err);
      });
      locals.req = req;

      if (reqTimeout) {
        req.setTimeout(reqTimeout, () => {
          reject(new Error('Request timeout: url=' + url));
        });
      }
    });
  }

  function post({
    path,
    postData,
    ...options
  }) {
    const reqOptions = Object.assign({
      path,
      postData,
      method: 'POST'
    }, options);
    return request(reqOptions);
  }

  function request(reqOptions) {
    const {
      postData,
      prependPath = true,
      method = 'GET',
      notify,
      outputFmt,
      transform
    } = reqOptions;
    let {
      postStr
    } = reqOptions;
    const {
      basePath
    } = _cfg;
    reqOptions.headers = Object.assign({}, _defaultHeaders, reqOptions.headers);
    const optsCopy = {
      auth,
      agent,
      family,
      hostname,
      port
    };
    const protoObj = proto === 'https' ? _https.default : _http.default;
    Object.assign(optsCopy, reqOptions);
    Object.assign(optsCopy.headers, reqOptions.headers);

    if (_cookies) {
      optsCopy.headers.Cookie = _cookies.join(';');
    }

    if (method === 'POST') {
      if (postData) {
        if (!optsCopy.headers['Content-Type']) {
          optsCopy.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        const stringifier = stringifiers[optsCopy.headers['Content-Type']];
        postStr = stringifier(postData);
        optsCopy.headers['Content-Length'] = postStr.length;
      } else if (postStr) {
        optsCopy.headers['Content-Length'] = postStr.length;
      }
    }

    if (basePath && prependPath) {
      optsCopy.path = `${basePath}${optsCopy.path}`;
    }

    return new Promise((resolve, reject) => {
      debug(optsCopy.agent.protocol + '//' + optsCopy.hostname + ':' + optsCopy.port + optsCopy.path);
      debug('[request] headers', optsCopy, optsCopy.headers);
      protoObj.request(optsCopy, res => {
        const {
          statusCode,
          headers
        } = res;
        debug('[response] statusCode', statusCode);
        debug('[response] headers', headers);

        if (statusCode !== 200) {
          reject({
            statusCode,
            headers
          });
          return;
        }

        if (notify) {
          notify({
            evt: 'response_status',
            data: {
              statusCode,
              headers
            }
          });
        }

        if (headers['set-cookie']) {
          cacheCookies(headers['set-cookie']);
        }

        async function handleResp(err, response) {
          if (err) {
            reject(err);
          } else {
            let finalResp;

            if (outputFmt) {
              finalResp = await formatResp(response, outputFmt);
            }

            if (transform) {
              finalResp = transform(finalResp);
            }

            resolve(finalResp);
          }
        }

        if (headers['content-encoding'] === 'gzip') {
          res.pipe((0, _zlib.createGunzip)()).pipe((0, _bl.default)(handleResp));
        } else {
          res.pipe((0, _bl.default)(handleResp));
        }
      }).on('error', err => {
        reject(err);
      }).end(postStr);
    });
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
    } = info;
    const {
      replaceToken = '[ITEM]'
    } = info;
    const collection = info[iteratee];
    const reqOptions = {
      method,
      path: info.path,
      outputFmt,
      headers,
      transform
    };
    let stringifier = _querystring.stringify;

    if (postDataTemplate) {
      if (!reqOptions.headers['Content-Type']) {
        reqOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }

      stringifier = stringifiers[reqOptions.headers['Content-Type']];
      reqOptions.postStrTemplate = stringifier(postDataTemplate);
      reqOptions.method = 'POST';
    }

    const batchMethod = sequential ? _promise.PromiseUtils.series : _promise.PromiseUtils.each;
    return batchMethod({
      items: collection,

      handleItem(item) {
        let replaceTokenCopy = replaceToken;

        if (pathTemplate) {
          reqOptions.path = pathTemplate.replace(replaceToken, item);
        }

        if (reqOptions.postStrTemplate) {
          if (reqOptions.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            replaceTokenCopy = encodeURIComponent(replaceToken);
          }

          reqOptions.postStr = reqOptions.postStrTemplate.replace(replaceTokenCopy, item).replace(replaceTokenCopy.toLowerCase(), item.toLowerCase());
        }

        return request(reqOptions).catch(err => {
          console.error('Error requesting item', item, err);
          return {
            item
          };
        });
      },

      notify
    });
  }

  return Object.freeze({
    cookiesValid,
    getCookies,
    setCookies,
    get,
    post,
    request,
    requestMany
  });
}