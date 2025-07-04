import fs from 'fs/promises';
import type { TypeDefFile } from './TypeDefFile';
import path from 'path';

/**
 * Gets a list of TS typedefs (if any) in a given path
 */

type PoorManCache = {
   [sourcepath: string]: TypeDefFile[];
}
const poorMansCache: PoorManCache = {};

export async function getTypedefs(sourcePath: string, virtualRoot: string): Promise<TypeDefFile[]> {
   if (poorMansCache[sourcePath]) {
      return poorMansCache[sourcePath];
   }

   const allFilesInPath = await fs.readdir(sourcePath, { recursive: true });
   const typeFilePaths = allFilesInPath.filter(fileName => fileName.endsWith('.d.ts'));

   const typeFiles = await Promise.all(typeFilePaths.map(async (filePath) => {
      return {
         path: path.join(virtualRoot, filePath),
         content: (await fs.readFile(path.join(sourcePath, filePath))).toString('utf-8')
      }
   }));

   poorMansCache[sourcePath] = typeFiles;


   return typeFiles;
}