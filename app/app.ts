// src/server.ts
import { fileURLToPath } from 'url'
import type { Config } from './config/Config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { redirectModuleImport } from './buildPlugins/redirectModuleImport';
import { listenForCompiledQuery } from './kysely';

Error.stackTraceLimit = 1000;

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
      const importedModule = await vite.ssrLoadModule(modulePath)

      const { compiledQuery, interpolatedQuery } = await listenForCompiledQuery(
         () => importedModule.customerNameQuery('bob', 1),
         'sqlite'
      );

      res.json({
         sampleConst: importedModule.sampleConst,
         interpolatedQuery,
         compiledQuery,
      })
   });

   app.use(vite.middlewares)

   // Serve frontend files via Express
   // TODO: serve these via Vite server as well, or HMR will not work
   // app.use('/', express.static(kypanelRoot))

   // Example: transform & serve backend modules manually

   app.listen(3000, () => console.log('Server running'));
}

