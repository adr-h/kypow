import type { Config } from './Config';
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite';
import { redirectPackageImport } from './vite-plugins/redirectPackageImport';
import { listenForCompiledQuery } from './kysely';
import { resolveDialectPlugin } from './sql/resolveDialectPlugin';
import { getFunctionMeta } from './type-system/getFunctionMeta';
import path from 'path';
import { searchFiles } from './file_system/searchFiles';

Error.stackTraceLimit = 1000;

const kypanelRoot = fileURLToPath(new URL('..', import.meta.url))

export type App = Awaited<ReturnType<typeof createApp>>

export async function createApp(config: Config) {
   const projectRoot = config.projectRoot;
   const imposterKyselyPackagePath = path.join(kypanelRoot, 'app', 'kysely', 'ImposterKyselyPackage.ts');

   const vite = await createViteServer({
      appType: 'custom',
      root: projectRoot, // Working directory is Vite's root
      ssr: {
         noExternal:  ['kysely', ...(config.noExternal || [])]
      },
      server: {
         middlewareMode: true,
         fs: {
            allow: [projectRoot, kypanelRoot] // Allow both dirs to resolve modules
         }
      },
      plugins: [
         redirectPackageImport({
            packageName: 'kysely',
            mockPath: imposterKyselyPackagePath
         })
      ]
   })
   const sqlDialect = resolveDialectPlugin(config.dialect);

   type GetQueryParams = {
      modulePath: string;
      functionName: string;
   }
   async function getQuery({modulePath, functionName}: GetQueryParams) {
      const functionMeta = await getFunctionMeta({
         modulePath, functionName, tsconfig: config.tsConfigPath
      });

      const importedModule = await vite.ssrLoadModule(modulePath)
      const { compiledQuery } = await listenForCompiledQuery(
         () => importedModule[functionName](...functionMeta.sampleParams),
      );

      const parametizedQuery = compiledQuery.sql;
      const interpolatedQuery = sqlDialect.interpolateSql(parametizedQuery, compiledQuery.parameters);

      return {
         name: functionMeta.name,
         description: functionMeta.description,
         params: functionMeta.paramsMeta,
         query: parametizedQuery,
         sampleQuery: interpolatedQuery,
      }
   }

   async function getQueryModules() {
      const files = searchFiles({
         searchPaths: ['**/**.ts', '**/**.js', '!node_modules', '!dist'],
         needle: '@isQuery',
         cwd: projectRoot
      });
      return files;
   }

   return {
      vite,
      getQuery,
      getQueryModules
   }
}