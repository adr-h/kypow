import type { Project } from "ts-morph";
import type { DialectPlugin } from "../../../lib/sql";
import { generateSampleArgs, getFunctionJsDocs } from "../../../lib/type-system";
import { getSqlForQuery } from "./getSqlForQuery";

type ModuleLoader = (path: string) => Promise<Record<string, any>>;

type GetQueryParams = {
   modulePath: string;
   functionName: string;
   tsProject: Project;
   sqlDialect: DialectPlugin;
   loadModule: ModuleLoader;
   timeout: number;
}
export async function getQueryService({modulePath, functionName, tsProject, sqlDialect, timeout, loadModule}: GetQueryParams) {
   const sampleParams = generateSampleArgs({
      tsProject,
      sourceFile: modulePath,
      functionName
   });

   const docs = getFunctionJsDocs({
      tsProject,
      sourceFile: modulePath,
      functionName
   });

   console.info(`sampleParams:`, sampleParams);

   const { interpolatedSql, parametizedSql } = await getSqlForQuery({
      modulePath,
      queryFunctionName: functionName,
      params: sampleParams,
      sqlDialect,
      loadModule, // :(
      timeout
   });

   return {
      name: functionName,
      description: docs,
      sql: parametizedSql,
      interpolatedSql:interpolatedSql,
      paramsUsed: sampleParams
   }
}