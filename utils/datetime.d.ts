declare type dateT = Date | string | number;

export function isDate(input: any): boolean;
export type isDate = typeof isDate;

/**
 * Changes a date string from an old format to a new one.
 * "yyyy": year, "MM": month, "dd": day
 */
export function changeDateFmt(input: string, oldFmt: string, newFmt: string): string;
export type changeDateFmt = typeof changeDateFmt;

/**
 * Build a duration string specifying number of days ('d'),
 * months ('m'), or years ('y') based on the provided start and
 * end dates
 *
 * Returns days if less than 30, months if less than 365,
 * and years otherwise.
 */
export function durationStr(startDate: dateT, endDate: number): string;
export type durationStr = typeof durationStr;

/**
 * For a given date, either milliseconds, string or date instance,
 * return a date string of the specified format
 * MM: month, dd: days, yyyy: fullYear, hh: hours, mm: minutes,
 * a: am/pm. Default fmt = 'MM/dd/yyyy'
 */
export function fmtDate(input: dateT, dateFmt?: string): string;
export type fmtDate = typeof fmtDate;

/**
 * For a given date and time that exist separately,
 * merge the two into a single date object.
 */
export function mergeDateTime(date: dateT, time: dateT): Date;
export type mergeDateTime = typeof mergeDateTime;

/**
 * Return next N years as a date
 */
export function nextNYears(n?: number, fromDate?: dateT): Date;
export type nTimeFn = typeof nextNYears;

/**
 * Return next N years as a date string
 */
export function nextNYearStr(n: number, fromDate?: dateT, format?: string): string;
export type nTimeFnStr = typeof nextNYearStr;

/**
 * Return next N months as a date
 */
export function nextNMonths(n?: number, fromDate?: dateT): Date;

/**
 * Return prev N months as a date
 */
export function prevNMonths(n?: number, fromDate?: dateT): Date;

/**
 * Return prev N years as a date
 */
export function prevNYears(n?: number, fromDate?: dateT): Date;

/**
 * Return prev N years as a date string
 */
export function prevNYearStr(n: number, fromDate?: dateT, format?: string): string;

export const msPerDay: 86400000;
export function today(): Date;

/**
 * Returns today as a date string
 */
export function todayStr(format?: string): string;
export type todayStr = typeof todayStr;

/**
 * Convert number of days to milliseconds
 */
export function daysToMs(nDays: number): number;
export type daysToMs = typeof daysToMs;

/**
 * Return next N quarters as a date, using the 15th of that month
 */
export function nextNQuarters(n?: number, fromDate?: dateT): Date;

/**
 * Return prev N quarters as a date, using the 15th of that month
 */
export function prevNQuarters(n?: number, fromDate?: dateT): Date;

export default DateTimeUtils;
declare const DateTimeUtils: Readonly<{
    isDate: isDate;
    msPerDay: number;
    today: () => Date;
    changeDateFmt: changeDateFmt;
    daysToMs: daysToMs;
    durationStr: durationStr;
    fmtDate: fmtDate;
    mergeDateTime: mergeDateTime;
    nextNQuarters: nTimeFn;
    nextNMonths: nTimeFn;
    nextNYears: nTimeFn;
    nextNYearStr: nTimeFnStr;
    prevNQuarters: nTimeFn;
    prevNMonths: nTimeFn;
    prevNYears: nTimeFn;
    prevNYearStr: nTimeFnStr;
    todayStr: todayStr;
}>;