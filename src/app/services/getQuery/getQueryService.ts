import type { Project } from "ts-morph";
import type { DialectPlugin } from "../../../lib/sql";
import { generateSampleArgs, getFunctionJsDocs } from "../../../lib/type-system";
import { getSqlForQuery } from "./getSqlForQuery";
import type { ViteDevServer } from "vite";

type GetQueryParams = {
   modulePath: string;
   functionName: string;
   functionParams?: any[];
   tsProject: Project;
   sqlDialect: DialectPlugin;
   vite: ViteDevServer;
   timeout: number;
}
export async function getQueryService({modulePath, functionName, functionParams, tsProject, sqlDialect, timeout, vite}: GetQueryParams) {
   const docs = getFunctionJsDocs({
      tsProject,
      sourceFile: modulePath,
      functionName
   });

   const loadModule = async (modulePath: string) => {
      return vite.ssrLoadModule(modulePath);
   }

   const paramsForQuery = functionParams || generateSampleArgs({
      tsProject,
      sourceFile: modulePath,
      functionName
   });

   const { interpolatedSql, parametizedSql } = await getSqlForQuery({
      modulePath,
      queryFunctionName: functionName,
      params: paramsForQuery,
      sqlDialect,
      loadModule, // :(
      timeout
   });

   return {
      name: functionName,
      description: docs,
      sql: parametizedSql,
      interpolatedSql:interpolatedSql,
      paramsUsed: paramsForQuery
   }
}