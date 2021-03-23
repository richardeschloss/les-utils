import { convertableToString } from "xml2js"

type xmlObj = { xml: Object }
export type stringTostring = (str: string) => string;

export function camelCase(str: string): string;
export function startCase(str: string): string;
export function parseXML(xml: convertableToString): Promise<xmlObj>;
export type parseXML = typeof parseXML;

declare const _default: Readonly<{
  camelCase: stringTostring;
  startCase: stringTostring;
  parseXML: parseXML;
}>;
export default _default;
