"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

var _promises = require("./promises");

var _debug = _interopRequireDefault(require("debug"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable prefer-promise-reject-errors */
const debug = (0, _debug.default)('utils:rexter');
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

function Rexter(cfg) {
  const {
    family = 4,
    proto = 'https',
    hostname = '',
    port = 443
  } = cfg;
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

  function batchRequests(info = {}) {
    const {
      iteratee = 'items',
      method,
      headers,
      pathTemplate,
      postDataTemplate,
      transform,
      sequential,
      outputFmt
    } = info;
    let {
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
      stringifier = stringifiers[reqOptions.headers['Content-Type']];
      reqOptions.postStrTemplate = stringifier(postDataTemplate);
      reqOptions.method = 'POST';
    }

    const batchMethod = sequential ? _promises.promiseSeries : _promises.promiseEach;
    return batchMethod({
      items: collection,

      handleItem(item) {
        reqOptions.path = pathTemplate.replace(replaceToken, item); // .replace(replaceToken.toLowerCase(), item.toLowerCase())

        if (reqOptions.postStrTemplate) {
          if (reqOptions.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            replaceToken = encodeURIComponent(replaceToken);
          }

          reqOptions.postStr = reqOptions.postStrTemplate.replace(replaceToken, item).replace(replaceToken.toLowerCase(), item.toLowerCase());
        }

        return request(reqOptions).catch(err => {
          return {
            item
          };
        });
      },

      transform: resp => collection.map(item => resp[item])
    });
  }

  function get({
    url,
    options
  }) {
    const {
      pathname: path,
      hostname,
      search
    } = new _url.URL(url);
    const reqOptions = Object.assign({
      path,
      hostname
    }, options);
    reqOptions.path += search;
    return request(reqOptions);
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

  function downloadFile({
    url,
    dest,
    notify
  }) {
    return new Promise(resolve => {
      const outStream = _fs.default.createWriteStream(dest);

      const protoObj = proto === 'https' ? _https.default : _http.default;
      protoObj.get(url, res => {
        res.pipe(outStream);
        const size = parseInt(res.headers['content-length']);
        let bytesRxd = 0;
        let downloadProgress = 0;
        res.on('data', d => {
          bytesRxd += d.length;
          downloadProgress = bytesRxd / size * 100;

          if (notify) {
            notify({
              evt: 'setDownloadProgress',
              data: {
                downloadProgress
              }
            });
          }
        }).on('end', resolve);
      });
    });
  }

  function request(reqOptions) {
    const {
      postData,
      method = 'GET',
      notify,
      outputFmt,
      transform
    } = reqOptions;
    let {
      postStr
    } = reqOptions;
    reqOptions.headers = Object.assign({}, _defaultHeaders, reqOptions.headers);
    const optsCopy = {
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

  return Object.freeze({
    batchRequests,
    cookiesValid,
    getCookies,
    setCookies,
    get,
    post,
    downloadFile,
    request
  });
}