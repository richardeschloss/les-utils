import { ClientRequest, RequestOptions, IncomingMessage } from 'https'
import { URL } from 'url'
import { parseXML } from './string'

interface Locals {
  bytesRxd?: number;
  req?: ClientRequest;
  res?: IncomingMessage;
  outStream?: WriteStream;
  output?: string;
}

interface StreamOptions {
  dest?: string | WriteStream;
  locals?: Locals;
  notify?: function;
  progress?: boolean;
  reqPath?: string;
  transform?: string | function; 
  writeOptions?: object;
}

interface GetOptions extends RequestOptions, StreamOptions {
  reqTimeout?: number;
}

interface RexterOptions extends GetOptions {
  postData?: object | string;
  redirectLimit?: number;
  redirectCnt?: number;
}

interface BatchReqOptions extends RexterOptions {
  paths: string | Array<string>;
  tokens?: Array<any>;
}

interface PostOptions extends RexterOptions {
  postData: object | string;
}

export namespace _ {
  export type transformers = Readonly<{
    csv: (resp: string | Buffer) => any,
    json: typeof JSON.parse,
    string: (resp: Buffer) => string,
    xml: parseXML
  }>;

  /** 
   * Returns the URL instance as an object 
   * (so that it can be merged with other objects)
   */
  export type urlInstToObj = (urlInst: URL) => any;

  export type cacheCookies = (cookies: Array<string>) => Array<{
    [key: string]: string;
  }>;

  export function handleResp(
    res: IncomingMessage, 
    opts: StreamOptions
  )
  export type handleResp = typeof handleResp;

  /**
   * For a given template string, treat the strings prefixed with ":"
   * as tokens, and replace them
   * 
   * Return if tokens are undefined or empty
   * 
   * This is used by the batch method
   * 
   * Example:
   * 1. for template = /some/path/:id, tokens = [{id: 123},{id: 456}]
   * 
   * Return ['/some/path/123', '/some/path/456']
   */
  export function parseTemplate(template: string, tokens: Array<any>): Array<string>;
  export type parseTemplate = typeof parseTemplate;

  /**
   * For a given array of relative or absolute paths,
   * returns the parsed path and, if it's an absolute URL the hostname.
   * This info then gets passed into the request method.
   * 
   * This is used by the batch method
   */
  export function parsePaths(paths: Array<string>): 
    Array<{ path: string, hostname?: string, protocol?: string, port?: string }>
  export type parsePaths = typeof parsePaths;

  /** 
   * For any postData object, and for a provided set of tokens, where
   * each token in the postData object is a string prefixed with ":", 
   * replace the token with the supplied values.
   * 
   * This is used by the batch method
   * 
   * Example:
   * const postData = {
   *   info: ':id'
   * }
   * const tokens = [{ id: 123 }, { id: 456 }]
   * 
   * This function would return:
   * [{ info: '123' }, { info: '456' }] 
   */
  export function parsePostDataTemplate(postData: any, tokens: Array<any>): Array<string>;
  export type parsePostDataTemplate = typeof parsePostDataTemplate;
}

/**
 * Checks to see if required environment variables
 * are defined
 */
export function checkEnv(reqdVars: Array<string>): void;
export type checkEnv = typeof checkEnv;

declare type rexter = Readonly<{
  cookiesValid: () => boolean,
  get: (url: string, options?: GetOptions) => Promise<any>,
  post: (url: string, options?: PostOptions) => Promise<any>,
  request: (options: RexterOptions) => Promise<any>,
  /** 
   * Perform a batch request using the same set of request options
   * Examples:
   * 1. rexter.batch({
   *   paths: '/some/:id/:token2',
   *   tokens: [{ id: '111', token2: 'abc' }, { id: '321', token2: 'xyz' }]
   * })
   * --> Request ['/some/111/abc', '/some/321/xyz']
   * 
   * 2. rexter.batch({
   *  paths: ['http://someurl1', 'http://someurl2']
   * })
   * --> Request ['http://someurl1', 'http://someurl2']
   * (pass in the hostnames "someurl1" and "someurl2")
   * 
   * 3. rexter.batch({
   *   paths: ['/some/path/1', '/another/path/1']
   * })
   * --> Request ['/some/path/1', '/another/path/1']
   * 
   * 4) A combination of 1-3:
   *  rexter.batch({
   *   paths: ['/some/path/1', '/another/path/1', 'http://someurl1', 'http://someurl2']
   * })
   * 
   * --> Request: [
   *   '/some/path/1', '/another/path/1',
   *   'http://someurl1', 'http://someurl2'
   * ]
   * 
   * If the entry contains a protocol "http://" or https://",
   * parse it into hostname/path parts then pass to rexter.request.
   * 
   * If postData is provided, the reqMethod will be 
   * automatically set to POST. For 1-4, the same postData will be sent 
   * to all request urls.
   * 
   * More flexibility may come from the Promise.each and Promise.series methods,
   * which also have groupBy as an option.  
   */
  batch: (options: BatchReqOptions) => Promise<any>
}>;

export function Rexter(cfg: {
  hostname?: string;
  protocol?: string;
  port?: string;
}): rexter;

export type Rexter = typeof Rexter

export default Rexter 