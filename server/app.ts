// src/server.ts
import express from 'express';
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite';
import path, { resolve } from 'path';
import fs from 'fs/promises';
import type { Config } from './config/Config';
import esbuild from 'esbuild';
import { externaliseImportsPlugin } from './externaliseImportsPlugin';

import { getTypedefs, type TypeDefFile } from './services/type-system';
// import {Generator} from 'npm-dts'
import { generateDtsBundle } from 'dts-bundle-generator';

// const { dtsPlugin } = require("esbuild-plugin-d.ts");

const kypanelRoot = fileURLToPath(new URL('..', import.meta.url))

export function setup(config: Config) {
   const projectRoot = config.projectRoot;

   const run = async () => {
      const app = express();

      app.get('/config', (req, res) => {
         res.json(config);
      })

      app.get('/typedefs', async (req, res) => {
         console.log('hit this path');
         const pathParam = req.query.path as string | undefined;
         const virtualRootParam = req.query.root as string | undefined;


         if (!pathParam || !virtualRootParam) {
            res.json({ "why": ":(" })
            return;
         }

         let typedefs: TypeDefFile[] = [];
         if (pathParam.startsWith('@kypanel')) {
            const kypanelRelativePath = pathParam.replace('@kypanel', kypanelRoot);

            typedefs = await getTypedefs(kypanelRelativePath, virtualRootParam);
         } else {
            // TODO: alias resolution with the projectRoot's tsconfig maaaaay be necessary
            typedefs = await getTypedefs(pathParam, virtualRootParam);
         }

         res.json(typedefs);
      });

      app.get('/exec', async (req, res) => {
         const inputCode = `
            // import bar from '@foo/yasm';
            // import { customerQuery } from '@foo/customerQuery';
            import _ from "lodash";
            import idk from 'kysely-codegen';

            const object = { 'p': [{ 'q': { 'r': 7 } }, 9] };
            const at_elem = _.at(object, ['p[0].q.r', 'p[1]']);

            export function exec(foo: typeof _) {
               console.log('presto');
               console.log(at_elem);
               // console.log(bar);
               // customerQuery();

               return 'wam bam kazam'
            }
         `;


         const result = await esbuild.build({
            stdin: {
               contents: inputCode,
               resolveDir: projectRoot,  // for resolving node_modules
               loader: 'ts',
            },
            tsconfig: config.tsConfigPath,
            plugins: [
               // TODO: this leaves alias imports untouched - may still need to transform them
               // alternatively just use vite-node or tsx permanently?
               externaliseImportsPlugin()
            ],
            bundle: true,
            write: false,
            platform: 'node',
            format: config.moduleFormat
         });

         const outputCode = result.outputFiles[0].text;
         await fs.writeFile(`${projectRoot}/.kypanel/build/_temp.ts`, inputCode);
         await fs.writeFile(`${projectRoot}/.kypanel/build/_temp.js`, outputCode);

         const getDeclarationFiles = async () => {
            const bundled = generateDtsBundle([
               {
                  filePath: `${projectRoot}/.kypanel/build/_temp.ts`,
                  noCheck: true, // this is exposed in the CLI tool as a public arg, but not in the TS typing. I should make a PR for this lib...
                  output: {
                     noBanner: true,
                     exportReferencedTypes: true, // Pulls referenced types inline
                  },
                  libraries: {
                     inlinedLibraries: ['lodash']
                  }
               },
            ], {

               preferredConfigPath: config.tsConfigPath
            });
            console.log('dts bundle', bundled[0]);  // Your complete `.d.ts` content as string

            await fs.writeFile(`${projectRoot}/.kypanel/build/_temp.d.ts`, bundled[0])
         };
         getDeclarationFiles();

         const { exec } = await import(`${projectRoot}/.kypanel/build/_temp.js`);
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
               return fs.readFile(path.join(kypanelRoot, 'index.html'), 'utf-8');
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

