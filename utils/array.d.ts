/** 
 * For an array of objects, returns a new 
 * array with specified keys omitted 
 */
export function omit(arr: any[], keys: Array<string>): any[];
export type omit = typeof omit;

/** 
 * For an array of objects, returns a new 
 * array with specified keys picked 
 */
export function pick(arr: any[], keys: Array<string>): any[];
export type pick = typeof pick;

/**
 * Updates or inserts an element into the provided array
 */
export function upsert(arr?: any[], obj?: Object, keyBy?: string): void;
export type upsert = typeof upsert;

export function sortBy(arr?: any[], key: string, valKey?: string): any[];
export type sortBy = typeof sortBy;

declare var _default: Readonly<{
    omit: omit;
    pick: pick;
    upsert: upsert;
    sortBy: sortBy;
}>;
export default _default;
