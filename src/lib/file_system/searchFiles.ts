import fg from 'fast-glob';
import fs from 'fs/promises';

type SearchFileParams = {
   searchPaths: string[];
   needle: string;
   cwd?: string
}

export async function searchFiles({ searchPaths, needle, cwd = process.cwd() }: SearchFileParams) {
   const results = [];

   const stream = fg.stream(searchPaths, { cwd });
   for await (const fileName of stream) {
      const content = await fs.readFile(fileName, "utf8");
      content.includes(needle) && results.push(fileName.toString());
   }
   return results;
}