import { searchFiles } from "../../../lib/file_system";
import { IS_QUERY_TAG } from "../../constants";

type Params = {
   searchPaths: string[];
   ignorePaths: string[];
   cwd: string;
}
export async function listQueryModulesService({ searchPaths, ignorePaths, cwd }: Params) {
   const files = await searchFiles({
      searchPaths,
      ignorePaths,
      needle: IS_QUERY_TAG,
      cwd
   });

   return files;
}