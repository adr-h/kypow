// TODO: wip poc to try to list "query modules" using the Typescript AST instead of grepping for a JSDoc tag
// code will be a mess. will clean up later
import path from "node:path";
import { type Project } from "ts-morph";
import { isQueryFunction } from "../../appLib/query";

type Params = {
   tsProject: Project,
   cwd?: string;
}
export async function listQueryModulesService({ tsProject, cwd }: Params) {
   const sources = tsProject.getSourceFiles();
   const relevantModules: Record<string, string[]> = {};

   for (const source of sources) {
      const functions = source.getFunctions();

      for (const f of functions) {
         if (!isQueryFunction(f)) continue;

         const filePath = cwd ? path.relative(cwd, source.getFilePath()) : source.getFilePath();

         if (!relevantModules[filePath]) relevantModules[filePath] = [];
         relevantModules[filePath].push(f.getName()!);
      }
   }

   const modulesList = Object.entries(relevantModules)
      .map(([module, queries]) => ({
         modulePath: module,
         queries
      }))
      .sort((first, second) => {
         return first.modulePath > second.modulePath ? 1 : -1
      })

   return modulesList;
}
