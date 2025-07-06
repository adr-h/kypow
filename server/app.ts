// src/server.ts
import express from 'express';
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite';
import path, { resolve } from 'path';
import fs from 'fs/promises';
import type { Config } from './config/Config';
import esbuild from 'esbuild';
import { resolveRelativeImports } from './services/build/resolveRelativeImports';

import { getTypedefs, type TypeDefFile } from './services/type-system';
// import {Generator} from 'npm-dts'
import { generateDtsBundle } from 'dts-bundle-generator';
import { mockDbModulePlugin } from './services/build/mockDbModulePlugin';

// const { dtsPlugin } = require("esbuild-plugin-d.ts");

const kypanelRoot = fileURLToPath(new URL('..', import.meta.url))

export function setup(config: Config) {
   const projectRoot = config.projectRoot;

   const run = async () => {
      const app = express();

      app.get('/config', (req, res) => {
         res.json(config);
      })

      app.get('/api/modules-index', (req, res) => {
         // TODO: actually scan the dir for queries
         // return {
         //    paths: [
         //       './src/queries/customerQuery.ts'
         //    ]
         // }
         res.json([
            {
               path: 'src/queries/customerQuery.ts'
            }
         ])
      })

      // TOOD: make this a POST req? User might be trying to run an INSERT for all I know
      // then again, our dummy driver _should_ be making this sideeffect free, unless the user is doing some
      // other wickedness that does not involve kysely/dbs
      // http://localhost:6006/api/modules/src/queries/customerQuery.ts/compiled-sql?function=customerNameQuery&params=[1]
      app.get('/api/modules/*module/compiled-sql', async (req, res) => {
         const moduleParam: string = req.params.module?.join('/');
         const functionName: string = req.query.function;
         const functionParams: any[] = JSON.parse(req.query.params || '[]');

         const fullModulePath = path.resolve(projectRoot, moduleParam);
         const moduleContents = await fs.readFile(fullModulePath, 'utf8');

         const projectRelativeFileDir = path.dirname(fullModulePath);
         const result = await esbuild.build({
            stdin: {
               contents: moduleContents,
               resolveDir: `${projectRoot}/.kypanel/build`,  // for resolving relative imports
               loader: 'ts',
            },
            tsconfig: config.tsConfigPath,
            plugins: [
               ...config.compileMode.dbModules.map(({ source, destination }) => mockDbModulePlugin({
                  source, destination, projectRoot, projectRelativeFileDir
               })),
               resolveRelativeImports(projectRelativeFileDir)
            ],
            bundle: true,
            write: false,
            platform: 'node',
            format: config.moduleFormat
         });
         const outputCode = result.outputFiles[0].text;
         await fs.writeFile(`${projectRoot}/.kypanel/build/_temp.js`, outputCode);

         const { [functionName]: exec } = await import(`${projectRoot}/.kypanel/build/_temp.js`);
         const payload = await exec(...functionParams);

         // nasty hack because I'm too lazy to wire up events for this release
         const compiledQuery = payload?.[0]?.[Symbol.for('kypanelCompiledQuery')];

         return res.json({
            compiledQuery
         });
      })

      app.get('/api/modules/*module', async (req, res) => {
         const moduleParam: string = req.params.module?.join('/');

         const fullModulePath = path.resolve(projectRoot, moduleParam);
         const moduleContents = await fs.readFile(fullModulePath, 'utf8');

         return res.json({
            contents: moduleContents,
            executableFunctions: [
               // TODO: generate based on file contents
               {
                  name: 'customerNameQuery',
                  params: [
                     {
                        name: 'limit',
                        type: 'number',
                        default: 1
                     }
                  ]
               }
            ],
         });
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

            // relative to '.kypanel/build'
            // import {mayonaise, much, gah2} from '../../src/fiz';

            // relative to 'src'
            import {mayonaise, much, gah2} from './fiz';
            import {db, dbIsOk} from './db';

            import _ from "lodash";
            import idk from 'kysely-codegen';

            const object = { 'p': [{ 'q': { 'r': 7 } }, 9] };
            const at_elem = _.at(object, ['p[0].q.r', 'p[1]']);

            export async function exec(foo: typeof _) {
               console.log('presto');
               console.log(at_elem);
               console.log('mayonaise is', much, mayonaise, gah2)
               console.log('db is ok:', dbIsOk)


               console.log('');
               console.log('import.meta.url',  import.meta.url);
               // console.log(bar);
               // customerQuery();

               const res = await db.selectFrom('customers').limit(1).execute();
               return res;
            }
         `;
         const projectRelativeFileDir = `${projectRoot}/src`;

         const result = await esbuild.build({
            stdin: {
               contents: inputCode,
               resolveDir: `${projectRoot}/.kypanel/build`,  // for resolving relative imports
               loader: 'ts',
            },
            tsconfig: config.tsConfigPath,
            plugins: [
               ...config.compileMode.dbModules.map(({ source, destination }) => mockDbModulePlugin({
                  source, destination, projectRoot, projectRelativeFileDir
               })),
               resolveRelativeImports(projectRelativeFileDir)
            ],
            bundle: true,
            write: false,
            platform: 'node',
            format: config.moduleFormat
         });

         const outputCode = result.outputFiles[0].text;
         await fs.writeFile(`${projectRoot}/.kypanel/build/_temp.ts`, inputCode);
         await fs.writeFile(`${projectRoot}/.kypanel/build/_temp.js`, outputCode);

         const { exec } = await import(`${projectRoot}/.kypanel/build/_temp.js`);
         const payload = await exec();

         // nasty hack because I'm too lazy to wire up events for this release
         const compiledQuery = payload?.[0]?.[Symbol.for('kypanelCompiledQuery')];

         res.send({ result: payload, compiledQuery });
      })



      // Create Vite in middleware mode to serve UI
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

