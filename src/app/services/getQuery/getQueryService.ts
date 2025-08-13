import type { DialectPlugin } from "../../../lib/sql";
import { getFunctionMeta } from "../../../lib/type-system/getFunctionMeta";
import { getSqlForQuery } from "./getSqlForQuery";

type ModuleLoader = (path: string) => Promise<Record<string, any>>;
type ModuleListenerRegistrar = (
   modulePath: string,
   callback: (removeListener: Function) => void
) => { removeListener: () => void };

type GetQueryParams = {
   modulePath: string;
   functionName: string;
   tsconfig: string;
   sqlDialect: DialectPlugin;
   loadModule: ModuleLoader;
}
export async function getQueryService({modulePath, functionName, tsconfig, sqlDialect, loadModule}: GetQueryParams) {
   const functionMeta = await getFunctionMeta({
      modulePath, functionName, tsconfig
   });

   const { interpolatedSql, parametizedSql } = await getSqlForQuery({
      modulePath,
      queryFunctionName: functionName,
      params: functionMeta.sampleParams,
      sqlDialect,
      loadModule, // :(
   });

   return {
      name: functionMeta.name,
      description: functionMeta.description,
      params: functionMeta.paramsMeta,
      sql: parametizedSql,
      sampleSql:interpolatedSql
   }
}