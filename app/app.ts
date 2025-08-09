import type { Config } from './Config';
import { fileURLToPath } from 'url'
import { resolveDialectPlugin } from './sql/resolveDialectPlugin';
import { getFunctionMeta } from './type-system/getFunctionMeta';
import path from 'path';
import * as query from './query';
import { createMockingViteServer } from './vite/createMockingViteServer';

Error.stackTraceLimit = 1000;

const kypanelRoot = fileURLToPath(new URL('..', import.meta.url))

export type App = Awaited<ReturnType<typeof createApp>>

export async function createApp(config: Config) {
   const projectRoot = config.projectRoot;
   const imposterKyselyPackagePath = path.join(kypanelRoot, 'app', 'kysely', 'ImposterKyselyPackage.ts');
   const tsconfig = config.tsConfigPath;
   const sqlDialect = resolveDialectPlugin(config.dialect);

   const vite = await createMockingViteServer({
      projectRoot,
      kypanelRoot,
      fakeKyselyPath: imposterKyselyPackagePath
   })

   type GetQueryParams = {
      modulePath: string;
      functionName: string;
   }
   async function getQuery({modulePath, functionName}: GetQueryParams) {
      const functionMeta = await getFunctionMeta({
         modulePath, functionName, tsconfig
      });

      const { interpolatedSql, parametizedSql } = await query.getSqlForQuery({
         modulePath,
         functionName,
         params: functionMeta.sampleParams,
         sqlDialect,
         vite, // :(
      });

      return {
         name: functionMeta.name,
         description: functionMeta.description,
         params: functionMeta.paramsMeta,
         sql: parametizedSql,
         sampleSql:interpolatedSql,
      }
   }

   async function listModulesWithQueries() {
      const modules = await query.listModulesWithQueries({
         searchPaths: ['**/**.ts', '**/**.js', '!node_modules', '!dist'],
         cwd: projectRoot
      });

      return modules;
   }

   type ListQueriesInModuleParams = {
      modulePath: string;
   }
   async function listQueriesInModule({ modulePath }: ListQueriesInModuleParams) {
      const queryNames = query.listQueriesInModule({
         modulePath, tsconfig
      })

      return queryNames;
   }

   // vite.watcher.

   return {
      vite,
      getQuery,
      listModulesWithQueries,
      listQueriesInModule
   }
}