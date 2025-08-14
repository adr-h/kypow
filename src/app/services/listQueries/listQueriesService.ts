import type { Project } from "ts-morph";
import { filterFunctionsInModule } from "../../../lib/type-system/filterFunctionsInModule";
import { IS_QUERY_TAG } from "../../constants";

type GetQueryFunctionsInModuleParams = {
   modulePath: string;
   tsProject: Project;
}
export async function listQueriesService({ modulePath, tsProject }: GetQueryFunctionsInModuleParams) {
   const functionNames = await filterFunctionsInModule({
      modulePath,
      tsProject,
      searchFunction: (f) => {
         return !!f.getJsDocs().find(doc => doc.getFullText().includes(IS_QUERY_TAG));
      }
   });

   return functionNames;
}