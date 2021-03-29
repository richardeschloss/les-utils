export function flip(obj: object): any;
export type flip = typeof flip;

export function omit(obj: object, keys: string[]): any;
export type omit = typeof omit;

export function pick(obj: object, keys: string | string[]): any;
export type pick = typeof pick;

/**
 * Removes falsy values from object
 */
export function prune(obj: object): any;
export type prune = typeof prune;

declare var _default: Readonly<{
    flip: flip;
    omit: omit;
    pick: pick;
    prune: prune;
}>;
export default _default;