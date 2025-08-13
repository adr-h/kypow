// import type { ViteDevServer } from "vite";
import { listenForCompiledQuery } from "./fake-kysely/listenForCompiledQuery";
import type { DialectPlugin } from "../../../lib/sql";
import { format } from 'sql-formatter';

type ModuleLoader = (path: string) => Promise<Record<string, any>>;
type ExecuteQueryParams = {
   modulePath: string;
   queryFunctionName: string;
   params: any[];
   sqlDialect: DialectPlugin;
   loadModule: ModuleLoader;
   timeout: number;
}
export async function getSqlForQuery({modulePath, queryFunctionName: functionName, params, sqlDialect, timeout, loadModule}: ExecuteQueryParams) {
   // const importedModule = await vite.ssrLoadModule(modulePath)
   const importedModule = await loadModule(modulePath);
   const { compiledQuery } = await listenForCompiledQuery(
      () => importedModule[functionName](params),
      timeout
   );

   const parametizedSql = compiledQuery.sql;
   const interpolatedSql = sqlDialect.interpolateSql(parametizedSql, compiledQuery.parameters);

   return {
      parametizedSql: format(parametizedSql),
      interpolatedSql: format(interpolatedSql),
   }
}