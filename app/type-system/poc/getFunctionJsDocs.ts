import { Project, ts, Type } from "ts-morph";

type GetFunctionDocsParameters = {
   modulePath: string;
   functionName: string;
   tsconfig: string;
}

export function getFunctionDocs({ tsconfig, modulePath, functionName}: GetFunctionDocsParameters) {
   const functionDeclaration = getFunctionDeclaration({tsconfig, modulePath, functionName});

   const jsDocs = functionDeclaration.getJsDocs();
   for (const doc of jsDocs) {
      const tags = doc.getTags();

      for (const tag of tags) {
         console.log('tags', tag.getTagName(), tag.getCommentText());
      }
   }
}


function getFunctionDeclaration({ tsconfig, modulePath, functionName}: GetFunctionDocsParameters) {
   console.time('creating TS project');
   const project = new Project({
      tsConfigFilePath: tsconfig,
   });
   console.timeEnd('creating TS project');


   console.time('getting source file');
   project.addSourceFileAtPath(modulePath);
   const importedModule = project.getSourceFile(modulePath);
   if (!importedModule) {
      throw new Error(`Module "${modulePath}" does not exist!`);
   }
   console.timeEnd('getting source file');

   const targetFunction = importedModule.getFunction(functionName);
   if (!targetFunction) {
      throw new Error(`Unable to find function "${functionName} in module "${modulePath}"`)
   }

   return targetFunction;
}