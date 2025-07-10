// src/server.ts
import { fileURLToPath } from 'url'
import type { Config } from './config/Config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { redirectModuleImport } from './buildPlugins/redirectModuleImport';
import { getQueryExecutionEmitter } from './kysely/QueryExecutionEmitter';

const kypanelRoot = fileURLToPath(new URL('..', import.meta.url))

export async function setup(config: Config) {
   const projectRoot = config.projectRoot;

   const vite = await createViteServer({
      appType: 'custom',
      root: projectRoot, // Working directory is Vite's root
      server: {
         middlewareMode: true,
         fs: {
            allow: [projectRoot, kypanelRoot] // Allow both dirs to resolve modules
         }
      },
      resolve: {
         alias: {
            '@frontend': kypanelRoot
         }
      },
      plugins: [
         redirectModuleImport({
            mockModuleAbsolutePath: config.mocks[0]?.pathToMockModule,
            originalModuleAbsolutePath: config.mocks[0]?.pathToOriginalModule
         })
      ]
   })

   const app = express();

   app.get('/api/execute-module', async (req, res) => {
      const modulePath = "./src/queries/customerQuery.ts";
      const importResult = await vite.ssrLoadModule(modulePath)

      const queryPromise = getQueryExecutionEmitter().onceQueryExecuted();

      await importResult.customerNameQuery(1);

      const queryResult = await queryPromise;

      // TODO: wouldn't something like this be cool? it might help that the callback function below
      // would have its stack context "within" runInQueryScope, which we might be able to use to do
      // something cool like determine if this is the _exact_ stack that the query was triggered from
      // probably by doing something magic like having runInQueryScope spawn an object with a getter and
      // having that getter execute the callback, and then triggering that getter with a randomly generated ID
      // and then when we get back the result from onceQueryExecuted internally it will compare to see if the
      // stack trace in it has the same randomly generated ID
      // const {compiledQuery} = await runInQueryScope(() => {
      //    importResult.customerNameQuery(1);
      // })

      res.json({
         sampleConst: importResult.sampleConst,
         compiledQuery: queryResult.compiledQuery,
         stack: queryResult.stackTrace
      })

      return;
   });

   app.use(vite.middlewares)

   // Serve frontend files via Express
   // TODO: serve these via Vite server as well, or HMR will not work
   // app.use('/', express.static(kypanelRoot))

   // Example: transform & serve backend modules manually

   app.listen(3000, () => console.log('Server running'));
}

