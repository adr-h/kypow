import { searchFiles } from "../../lib/file_system/searchFiles";
import { IS_QUERY_TAG } from "./constants";

type ModulesWithQueryTagParams = {
   searchPaths: string[];
   ignorePaths?: string[];
   cwd?: string
}
export async function listModulesWithQueries({ searchPaths, ignorePaths, cwd }: ModulesWithQueryTagParams) {
   const files = await searchFiles({
      searchPaths,
      ignorePaths,
      needle: IS_QUERY_TAG,
      cwd
   });
   return files;
}