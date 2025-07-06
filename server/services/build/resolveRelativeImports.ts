import path from 'path';
import fs from 'fs/promises';
import type { Plugin, OnResolveArgs } from "esbuild";

export const resolveRelativeImports = (projectRelativeFileDir: string): Plugin => ({
   name: 'externalize',
   setup(build) {
      build.onResolve({ filter: /.*/ }, async (args) => {
         const isRelativePath = args.path.startsWith('./') || args.path.startsWith('../');
         if (isRelativePath) {
            const pathToActualFileDir = path.relative(args.resolveDir, projectRelativeFileDir);
            const _a = path.resolve(args.resolveDir, pathToActualFileDir)
            // console.log('_a', _a);

            const candidates = [
               path.resolve(_a, args.path + ".d.ts"),
               path.resolve(_a, args.path + ".ts"),
               path.resolve(_a, args.path + ".js"),
               path.resolve(_a, args.path + ".tsx"),
               path.resolve(_a, args.path + ".jsx"),
               path.resolve(_a, args.path + ".json"),

               path.resolve(_a, args.path + "index.d.ts"),
               path.resolve(_a, args.path, "index.ts"),
               path.resolve(_a, args.path, "index.js"),
               path.resolve(_a, args.path, "index.jsx"),
               path.resolve(_a, args.path, "index.tsx"),
            ];

            for (const file of candidates) {
               try {
                  // console.log('finding', file,'. its resolverdir was', args.resolveDir);
                  if (await fs.stat(file)) {
                     // console.log('found', file);
                     return { path: file };
                  }
               } catch(_ex) {}
            }
         }

         return {
            path: args.path,
            external: true
         }
      });
   },
});