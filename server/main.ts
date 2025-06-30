// src/server.ts
import express from 'express';
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import type { Config } from './config/Config';
import esbuild from 'esbuild';

const kypanelRoot = fileURLToPath(new URL('..', import.meta.url))

export function setupKypanel(config: Config) {
   const projectRoot = config.projectRoot;

   const run = async () => {
      const app = express();

      app.get('/config', (req, res) => {
         res.json(config);
      })

      app.get('/compile', async (req, res) => {
         const code = `
            import bar from '@foo/yasm';
            import _ from "lodash";

            const object = { 'p': [{ 'q': { 'r': 7 } }, 9] };
            const at_elem = _.at(object, ['p[0].q.r', 'p[1]']);

            export function exec() {
               console.log('presto');
               console.log(at_elem);
               console.log(bar);
               return 'wam bam kazam'
            }
         `;

         // const rewriteAndBlockPathsPlugin = {
         //    name: 'rewrite-and-externalize',
         //    setup(build) {
         //       build.onResolve({ filter: /.*/ }, args => {
         //          if (args.path === '@schema-types') {
         //             return {
         //                path: './sample-types',
         //                external: true,
         //             };
         //          }

         //          if (args.path === 'kysely') {
         //             return {
         //                path: args.path,
         //                external: true
         //             }
         //          }

         //          return {
         //             errors: [{
         //                text: `Illegal import: "${args.path}"`,
         //                detail: 'The only allowed imports are: [@schema-types]',
         //             }],
         //          };
         //       });
         //    },
         // };

         const result = await esbuild.build({
            stdin: {
               contents: code,
               resolveDir: projectRoot,  // for resolving node_modules
               loader: 'ts',
            },
            tsconfig: config.tsConfigPath,
            // plugins: [rewriteAndBlockPathsPlugin],
            // 'bundle: true' is required to activate the onResolve hook.
            bundle: true,
            // 'write: false' returns the output in memory.
            write: false,
            format: 'esm',
            alias: {
               "@foo": "./src"  // TODO: auto transform using tsConfigPath instead of hardcoding
            }
         });

         await fs.promises.writeFile(`${projectRoot}/.kypanel/build/_temp.ts`, result.outputFiles[0].text);
         const { exec } = await import (`${projectRoot}/.kypanel/build/_temp.ts`);
         const payload = exec();

         res.send(payload);
      })


      // Create Vite in middleware mode
      const vite = await createViteServer({
         // root: projectRoot,
         root: kypanelRoot,
         server: { middlewareMode: true },
         plugins: [{
            name: 'kypanel-override',
            transformIndexHtml() {
               return fs.readFileSync(path.join(kypanelRoot, 'index.html'), 'utf-8');
            },

            // TODO: resolveId and transformIndexHtml might not be necessary anymore if we're just using root:kypanelRoot
            resolveId(source) {
               console.log('resolveId source', source)
               if (source === '/@kypanel/src/main.tsx') {
                  console.log('return path', path.resolve(kypanelRoot, 'src/main.tsx'))
                  return path.resolve(kypanelRoot, 'src/main.tsx');
               }
               return null;
            },
         }]
      });
      app.use(vite.middlewares);

      app.listen(6006, () => {
         console.log('Kypanel running at http://localhost:6006');
      });
   };

   run();
}

