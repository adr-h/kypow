import path from "path";
import fuzzysort from 'fuzzysort'
import type { Project } from "ts-morph";

type Params = {
   tsProject: Project,
   cwd?: string;
   searchInput: string;
}
export async function searchModulesService({ tsProject, cwd, searchInput }: Params) {
   const sources = tsProject.getSourceFiles();
   const filepaths = sources.map(s => cwd ? path.relative(cwd, s.getFilePath()) : s.getFilePath());

   const searchResults = fuzzysort.go(searchInput, filepaths);

   return searchResults;
}