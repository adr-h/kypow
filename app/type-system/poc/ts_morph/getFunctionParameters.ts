import { Project, ts, Type } from "ts-morph";

type GetFunctionParametersParameters = {
   modulePath: string;
   functionName: string;
   tsconfig: string;
}

export function getFunctionParameters({ tsconfig, modulePath, functionName}: GetFunctionParametersParameters) {
   const functionDeclaration = getFunctionDeclaration({tsconfig, modulePath, functionName});

   const functionParameters = functionDeclaration.getParameters()
      .map(f => f.getType())
      .map(t => resolveType(t));

   console.log('functionParameters', functionParameters);
}


function getFunctionDeclaration({ tsconfig, modulePath, functionName}: GetFunctionParametersParameters) {
   const project = new Project({
      tsConfigFilePath: tsconfig,
   });

   const importedModule = project.getSourceFile(modulePath);
   if (!importedModule) {
      throw new Error(`Module "${modulePath}" does not exist!`);
   }

   const targetFunction = importedModule.getFunction(functionName);
   if (!targetFunction) {
      throw new Error(`Unable to find function "${functionName} in module "${modulePath}"`)
   }

   return targetFunction;
}

function resolveType(t: Type<ts.Type>) {
   const res = {
      isAlias: t.getAliasSymbol()?.isAlias(),
      isInterface: t.isInterface()
   }
   return res;
}
