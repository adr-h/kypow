import type { ViteDevServer } from "vite";
import { listenForCompiledQuery } from "../kysely/listenForCompiledQuery";
import type { DialectPlugin } from "../sql";

type ExecuteQueryParams = {
   modulePath: string;
   functionName: string;
   params: any[];
   sqlDialect: DialectPlugin;
   vite: ViteDevServer; // eww. But also, awkward to refactor this. Come back later.
}
export async function getSqlForQuery({modulePath, functionName, params, sqlDialect, vite}: ExecuteQueryParams) {
   const importedModule = await vite.ssrLoadModule(modulePath)
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