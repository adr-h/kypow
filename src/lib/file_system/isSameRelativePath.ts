import path from 'path';

/**
 * If both pathA and pathB should resolve to the same path (e.g: "./src/path/to/foo" vs "src/path/to/foo"), returns true
 * @param pathA
 * @param pathB
 */
export function isSameRelativePath (pathA: string, pathB: string) {
   return path.relative(pathA, pathB) === '';
}