/** 
 * Gently copies files to destination 
 * Only overwrites if specified.
 */
export function gentlyCopy(
  filesList: string | Array<string>,
  dest: string,
  opt?: {
    overwrite?: boolean
  } 
): void;

export type gentlyCopy = typeof gentlyCopy;