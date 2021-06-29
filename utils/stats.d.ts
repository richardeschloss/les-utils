export function deltas(arr: number[]): number[];
export type deltas = typeof deltas;

/**
 * For a given array, returns the mean, and
 * upper and lower control limits).
 * Options
 * - `Period` determines the subset length to use for the 
 *   running calculation
 * - `factor` determines the number of standard deviations to use.
 */
export function controlStats(arr: number[], { period, factor }?: {
    period?: number;
    factor?: number;
}): {
    mean: number[];
    ucl: number[];
    lcl: number[];
};
export type controlStats = typeof controlStats;

export function rsi(arr: number[], { period }?: {
    period?: number;
}): number[];
export type rsi = typeof rsi;

export type numArrToNum = (arr: number[]) => number;

export const mean: numArrToNum;
export const stddev: numArrToNum;
export const sum: numArrToNum;
declare var _default: Readonly<{
    deltas: deltas;
    controlStats: controlStats;
    mean: numArrToNum;
    stddev: numArrToNum;
    sum: numArrToNum;
    rsi: rsi;
}>;
export default _default;