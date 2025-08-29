import type { Project } from "ts-morph";
import { filterFunctionsInModule } from "../../../lib/type-system/filterFunctionsInModule";
import { isQueryFunction } from "../../appLib/query";

type GetQueryFunctionsInModuleParams = {
   modulePath: string;
   tsProject: Project;
}
export async function listQueriesService({ modulePath, tsProject }: GetQueryFunctionsInModuleParams) {
   console.time('List queries');
   const functionNames = await filterFunctionsInModule({
      modulePath,
      tsProject,
      searchFunction: (f) => isQueryFunction(f)
   });
   console.timeEnd('List queries');

   return functionNames;
}