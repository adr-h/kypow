import type { Config } from './Config';
import { fileURLToPath } from 'url'
import { resolveDialectPlugin } from '../lib/sql/resolveDialectPlugin';
import { getFunctionMeta } from '../lib/type-system/getFunctionMeta';
import * as query from './query';
import { createViteWithKyselyImposter } from './createViteWithKyselyImposter';
import { KyselyImposterPath } from './fake-kysely';
import { createWatcher } from '../lib/file_system';

Error.stackTraceLimit = 1000;

const kypanelRoot = fileURLToPath(new URL('..', import.meta.url))

export type App = Awaited<ReturnType<typeof createApp>>

export async function createApp(config: Config) {
   const projectRoot = config.projectRoot;
   const tsconfig = config.tsConfigPath;
   const sqlDialect = resolveDialectPlugin(config.dialect);

   // TODO: customisable
   const searchPaths = ['src/**/**.ts', 'src/**/*.js'];
   const ignorePaths = ['node_modules']

   // const watcher = createWatcher({ searchPaths, ignorePaths, cwd: projectRoot });
   const vite = await createViteWithKyselyImposter({
      projectRoot,
      kypanelRoot,
      kyselyImposterModule: KyselyImposterPath
   })

   createWatcher({ searchPaths, ignorePaths, cwd: projectRoot })

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
         queryFunctionName: functionName,
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
         searchPaths,
         ignorePaths,
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

   return {
      vite,
      getQuery,
      listModulesWithQueries,
      listQueriesInModule
   }
}