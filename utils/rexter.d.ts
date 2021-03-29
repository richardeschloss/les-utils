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

}

/**
 * Checks to see if required environment variables
 * are defined
 */
export function checkEnv(reqdVars: Array<string>): void;
export type checkEnv = typeof checkEnv;

declare type rexter = Readonly<{
  cookiesValid: () => boolean,
  get: (url: string, options: GetOptions) => Promise<any>,
  post: (url: string, options: PostOptions) => Promise<any>,
  request: (options: RexterOptions) => Promise<any>
}>;

export function Rexter(cfg: {
  hostname?: string;
}): rexter;

export type Rexter = typeof Rexter

export default Rexter 