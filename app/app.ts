import type { Config } from './Config';
import { fileURLToPath } from 'url'
import { createServer as createViteServer, type ViteDevServer } from 'vite';
// import { redirectModuleImport } from './vite-plugins/redirectModuleImport';
import { listenForCompiledQuery } from './kysely-utils';
import { resolveDialectPlugin } from './sql/resolveDialectPlugin';
import { getFunctionMeta } from './type-system/getFunctionMeta';
import { Kysely } from 'kysely';
Error.stackTraceLimit = 1000;

const kypanelRoot = fileURLToPath(new URL('..', import.meta.url))

export type App = Awaited<ReturnType<typeof createApp>>

export async function createApp(config: Config) {
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
         alias: { '@frontend': kypanelRoot }
      },
      plugins: [
         // redirectModuleImport({
         //    mockModuleAbsolutePath: config.mocks[0]?.pathToMockModule,
         //    originalModuleAbsolutePath: config.mocks[0]?.pathToOriginalModule
         // })
      ]
   })
   const sqlDialect = resolveDialectPlugin(config.dialect);


   type GetQueryParams = {
      modulePath: string;
      functionName: string;
      invokeParams?: any[];
   }
   async function getQuery(params: GetQueryParams) {
      const modulePath = params.modulePath || "./src/queries/db.ts";
      const functionName = params.functionName || 'customerNameQuery';

      const functionMeta = await getFunctionMeta({
         modulePath, functionName, tsconfig: config.tsConfigPath
      });

      const executionParams = ['bob', 1] //TODO: invokeParams || functionMetadata.sampleParams
      // const importedModule = await vite.ssrLoadModule(modulePath)
      const importedModule = await import(`${projectRoot}/${modulePath}`);

      const { compiledQuery } = await listenForCompiledQuery(
         () => importedModule[functionName](...executionParams),
      );

      const parametizedQuery = compiledQuery.sql;
      const queryParameters = compiledQuery.parameters;
      const interpolatedQuery = sqlDialect.interpolateSql(parametizedQuery, queryParameters);

      return {
         // sampleConst: importedModule.sampleConst,
         name: functionMeta.name,
         description: functionMeta.description,
         interpolatedQuery,
         parametizedQuery,
         queryParamsUsed: executionParams,
      }
   }

   async function getModule() {
      // e.g:
      //    {
      //       module: 'path/to/module.ts',
      //       queries: [
      //          'getCustomer',
      //          'getSale'
      //       ]
      //    }
      //

      return [];
   }

   return {
      vite,
      getQuery
   }
}