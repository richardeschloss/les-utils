export declare namespace _ {
  /** 
   * Pre-processes an input that may be a string.
   * Returns the parsed float from the string (i.e., a currency or percentage)
   */
  export function preProcess(input: string|number): number; 
  export type preProcess = typeof preProcess; 

  /**
   * For a given number, abbreviates it (for large numbers)
   * 1000 = 1K, 1000000 = 1M, up to 1T.
   */
  export function abbreviateNumber(input: number): {num: number, unit: string}; 
  export type abbreviateNumber = typeof abbreviateNumber; 

  /**
   * Is the input already a currency, where we define
   * currency as { val: number, fmt: $[number] }
   */
  export function isCurrency(input: any, {currencySymbol: string }): boolean;
  export type isCurrency = typeof isCurrency;

  /**
   * Is the input already a date, where we define
   * date as { val: epochTime, fmt: [dateFmt] }
   */
  export function isDate(input: any): boolean;
  export type isDate = typeof isDate;

  /**
   * Is the input already a number, where we define
   * the number object as
   * { val: number, fmt: [number as string] }
   */
  export function isNumber(input: any): boolean;
  export type isNumber = typeof isNumber;

  /**
   * Is the input already a large number, where we define
   * the large number as
   * { val: number, fmt: [number with units] }
   */
  export function isLargeNumber(input: any): boolean;

  /**
   * Is the input already a large currency, where we define
   * large currency as { val: number, fmt: $[large number] }
   */
  export function isLargeCurrency(input: any, {currencySymbol: string }): boolean;
  export type isLargeCurrency = typeof isLargeCurrency;

  /**
   * Is the input already a percentage, where we define
   * the percentage as
   * { val: number, fmt: [number with '%'] }
   */
  export function isPercentage(input: any): boolean;
  export type isPercentage = typeof isPercentage;
}

declare type outputFmt = 'json' | 'fmt' | 'val';

/**
 * For a given number input, return an object containing
 * the currency as { val: number, fmt: [currency fmt] }
 */
export function currency(
  input: any, 
  opts?: {
    locale?: string;
    currency?: string;
    currencySymbol?: string;
  }
): { val: number, fmt: string };

export type currency = typeof currency;

/**
 * For a given input return a date as 
 * { val: number, fmt: [date fmt] }
 * 
 * Scale comes in handy if the input consists
 * of an object whose value needs to be scaled by 1000
 * (i.e., sometimes, some services scale the epochTime down)
 */
export function date(
  input: any,
  opts?: {
    dateFmt?: string;
    scale?: number;
  }
): { val: Date, fmt: string, epochTime: number };

export type dateT = typeof date; 

/**
 * For a given input return a largeCurrency as 
 * { val: number, fmt: [currency fmt] }
 */
export function largeCurrency(
  input: any,
  opts?: {
    locale?: string;
    currency?: string;
    currencySymbol?: string;
  }
): { val: number, fmt: string };
export type largeCurrency = typeof largeCurrency;

/**
 * For a given input return a largeNumber as 
 * { val: number, fmt: [number [unit]] }
 */
export function largeNumber(
  input: any,
  opts?: {
    locale?: string;
    precision?: number;
    scale?: number;
  }
): { val: number, fmt: string };
export type largeNumber = typeof largeNumber;

/**
 * For a given input return a number as 
 * { val: number, fmt: [number] }
 */
export function number(
  input: any,
  opts?: {
    locale?: string;
    precision?: number;
    scale?: number;
  }
): { val: number, fmt: string };
export type numberT = typeof number;

/**
 * For a given input return a percentage as 
 * { val: number, fmt: [number] % }
 */
export function percentage(
  input: any,
  opts?: {
    locale?: string;
    precision?: number;
    scale?: number;
  }
): { val: number, fmt: string };
export type percentage = typeof percentage;


export function string(input: string|number): string;
export type stringT = typeof string

export default FormatUtils;
declare const FormatUtils: Readonly<{
  currency: currency;
  date: dateT;
  largeCurrency: largeCurrency;
  largeNumber: largeNumber;
  number: numberT;
  percentage: percentage;
  string: stringT;
}>;