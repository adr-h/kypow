import { searchFiles } from "../../lib/file_system/searchFiles";
import { IS_QUERY_TAG } from "./constants";

type ModulesWithQueryTagParams = {
   searchPaths: string[];
   cwd?: string
}
export async function listModulesWithQueries({ searchPaths, cwd }: ModulesWithQueryTagParams) {
   const files = await searchFiles({
      searchPaths,
      needle: IS_QUERY_TAG,
      cwd
   });
   return files;
}