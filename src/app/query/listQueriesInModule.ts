import { filterFunctionsInModule } from "../../lib/type-system/filterFunctionsInModule";
import { IS_QUERY_TAG } from "./constants";


type GetQueryFunctionsInModuleParams = {
   modulePath: string;
   tsconfig: string;
}
export async function listQueriesInModule({modulePath, tsconfig}: GetQueryFunctionsInModuleParams) {
   const functionNames = await filterFunctionsInModule({
      modulePath,
      tsconfig,
      searchFunction: (f) => {
         return !!f.getJsDocs().find(doc => doc.getFullText().includes(IS_QUERY_TAG));
      }
   });

   return functionNames;
}