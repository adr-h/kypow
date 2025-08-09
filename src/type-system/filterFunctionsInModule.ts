import { FunctionDeclaration, Project } from "ts-morph";
import { IS_QUERY_TAG } from "../query/constants";

type SearchFunctionExportsInModuleParams = {
   modulePath: string;
   tsconfig: string;
   searchFunction: (f: FunctionDeclaration) => boolean;
}



export async function filterFunctionsInModule({ modulePath, tsconfig, searchFunction }: SearchFunctionExportsInModuleParams) {
   const project = new Project({
      tsConfigFilePath: tsconfig,
   });

   const sourceFile = project.getSourceFile(modulePath);
   const functions = sourceFile?.getFunctions() || [];
   const filteredFunctions = functions.filter(searchFunction)

   return filteredFunctions.map(f => f.getName())
}