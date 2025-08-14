import { FunctionDeclaration, Project } from "ts-morph";

type SearchFunctionExportsInModuleParams = {
   modulePath: string;
   tsProject: Project;
   searchFunction: (f: FunctionDeclaration) => boolean;
}

export async function filterFunctionsInModule({ modulePath, tsProject, searchFunction }: SearchFunctionExportsInModuleParams) {
   const sourceFile = tsProject.getSourceFile(modulePath);
   if (!sourceFile) throw new Error(`Module ${sourceFile} not found!`);

   const functions = sourceFile.getFunctions() || [];
   const filteredFunctions = functions.filter(searchFunction)

   return filteredFunctions.map(f => f.getName()).filter(name => name !== undefined);
}