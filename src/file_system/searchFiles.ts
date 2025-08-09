import {globby} from 'globby';
import fg from 'fast-glob';

import fs from 'fs/promises';

type SearchFileParams = {
   searchPaths: string[];
   needle: string;
   cwd?: string
}

export async function searchFiles({ searchPaths, needle, cwd = process.cwd() }: SearchFileParams) {
   // const files = await globby(searchPaths, { cwd });

   // const results = [];
   // for (const file of files) {
   //    const content = await fs.readFile(file, "utf8");
   //    content.includes(needle) && results.push(file);
   // }

   // return results;

   const results = [];

   const stream = fg.stream(searchPaths, { cwd });
   for await (const entry of stream) {
      const content = await fs.readFile(entry, "utf8");
      content.includes(needle) && results.push(entry);
   }
   return results;
}