// import type { ViteDevServer } from "vite";
import { listenForCompiledQuery } from "./fake-kysely/listenForCompiledQuery";
import type { DialectPlugin } from "../../../lib/sql";

type ModuleLoader = (path: string) => Promise<Record<string, any>>;
type ExecuteQueryParams = {
   modulePath: string;
   queryFunctionName: string;
   params: any[];
   sqlDialect: DialectPlugin;
   loadModule: ModuleLoader;
   // vite: ViteDevServer; // eww. But also, awkward to refactor this. Come back later.
}
export async function getSqlForQuery({modulePath, queryFunctionName: functionName, params, sqlDialect, loadModule}: ExecuteQueryParams) {
   // const importedModule = await vite.ssrLoadModule(modulePath)
   const importedModule = await loadModule(modulePath);
   const { compiledQuery } = await listenForCompiledQuery(
      () => importedModule[functionName](params),
   );

   const parametizedSql = compiledQuery.sql;
   const interpolatedSql = sqlDialect.interpolateSql(parametizedSql, compiledQuery.parameters);

   return {
      parametizedSql,
      interpolatedSql,
   }
}