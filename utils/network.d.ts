declare function findFreePort(opts: {
  range?: Array<number>,
  netstatOpts?: any
}): Promise<number>;

declare function netstatP(opts: any): Promise<Array[any]>;

declare function portTaken(opts: {
  port: number,
  netstatOpts: any
}): Promise<boolean>;

const NetUtils = {
  findFreePort,
  netstatP,
  portTaken
};
export declare type NetUtils = typeof NetUtils;

declare var _default: Readonly<NetUtils>;

export default _default