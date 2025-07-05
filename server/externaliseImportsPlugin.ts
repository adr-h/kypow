import path from 'path';
import fs from 'fs/promises';
import type { Plugin, OnResolveArgs } from "esbuild";


function resolveRealPath() {
   const esbuildResolveDirPath = '/home/adrian/Code/kypanel/_sample/.kypanel/build';
   const projectRelativePath = '/home/adrian/Code/kypanel/src/bat';


}

export const externaliseImportsPlugin = (projectRelativeFileDir: string): Plugin => ({
   name: 'externalize',
   setup(build) {
      build.onResolve({ filter: /.*/ }, async (args) => {
         // if (args.path === '@schema-types') {
         //    return {
         //       path: './sample-types',
         //       external: true,
         //    };
         // }

         // let fullPath = path.join(relativeContext, args.path);
         // await fs.stat()

         if (args.path.startsWith('.')) {
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
                  console.log('finding', file,'. its resolverdir was', args.resolveDir);
                  if (await fs.stat(file)) {
                     console.log('found', file);
                     return { path: file };
                  }
               } catch(_ex) {}
            }
         }

         return {
            path: args.path,
            external: true
         }


         return {
            errors: [{
               text: `Illegal import: "${args.path}"`,
               detail: 'The only allowed imports are: [@schema-types]',
            }],
         };
      });
   },
});