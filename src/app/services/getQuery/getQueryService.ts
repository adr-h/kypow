import type { DialectPlugin } from "../../../lib/sql";
import { getFunctionMeta } from "../../../lib/type-system";
import { getSqlForQuery } from "./getSqlForQuery";

type ModuleLoader = (path: string) => Promise<Record<string, any>>;

type GetQueryParams = {
   modulePath: string;
   functionName: string;
   tsconfig: string;
   sqlDialect: DialectPlugin;
   loadModule: ModuleLoader;
   timeout: number;
}
export async function getQueryService({modulePath, functionName, tsconfig, sqlDialect, timeout, loadModule}: GetQueryParams) {
   const functionMeta = await getFunctionMeta({
      modulePath, functionName, tsconfig
   });

   const { interpolatedSql, parametizedSql } = await getSqlForQuery({
      modulePath,
      queryFunctionName: functionName,
      params: functionMeta.sampleParams,
      sqlDialect,
      loadModule, // :(
      timeout
   });

   return {
      name: functionMeta.name,
      description: functionMeta.description,
      sql: parametizedSql,
      sampleSql:interpolatedSql,
      sampleParams: functionMeta.sampleParams
   }
}