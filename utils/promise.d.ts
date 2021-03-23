export function delay(ms: number): Promise<any>;
export type delay = (ms: number) => Promise<any>;

export type batchFn = (opts: {
    items: any[];
    groupBy?: string;
    handleItem: (arg0: any, arg1: number | null) => Promise<any>;
    transform?: (arg0: any) => any;
    notify?: function;
}) => Promise<any>

export const each: batchFn;
export const series: batchFn;

declare var _default: Readonly<{
  delay: delay;
  each: batchFn;
  series: batchFn;
}>;
export default _default;