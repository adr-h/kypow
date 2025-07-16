import { FunctionDeclaration, Project, ts, Type } from "ts-morph";

type GetFunctionDocsParameters = {
   modulePath: string;
   tsconfig: string;
}

export function getQueryFunctionsDetails({ tsconfig, modulePath }: GetFunctionDocsParameters) {
   const functionDeclarations = getFunctionDeclarations({ tsconfig, modulePath });

   const queryFunctionDetails = functionDeclarations
      .map(mapFunctionDetails)
      .filter((details) => details.isQueryFunction)

   console.log(queryFunctionDetails);
   return queryFunctionDetails;
}


type CommonFunctionDetails = {
   functionName: string,
   functionCode: string
}
type NotQueryFunctionDetails = CommonFunctionDetails & {
   isQueryFunction: false;
}
type ValidQueryFunctionDetails = CommonFunctionDetails & {
   isQueryFunction: true;
   queryParams: Array<any>;
   jsDoc: string;
}
type InvalidQueryFunctionDetails = CommonFunctionDetails & {
   isQueryFunction: true;
   error: string;
   jsDoc: string;
}
type FunctionDetails = NotQueryFunctionDetails | ValidQueryFunctionDetails | InvalidQueryFunctionDetails;
function mapFunctionDetails(functionDeclaration: FunctionDeclaration): FunctionDetails {
   const commonDetails: CommonFunctionDetails = {
      functionName: functionDeclaration.getName() || '<anonymous>',
      functionCode: getFunctionTextWithoutJsDoc(functionDeclaration)
   }

   const allDocs = functionDeclaration.getJsDocs();
   if (allDocs.length === 0) {
      return {
         ...commonDetails,
         isQueryFunction: false
      };
   }

   const jsDoc = allDocs[allDocs.length -1]; // get the last doc; multi block JSDocs are usually a mistake
   const fullJsDocText = jsDoc.getFullText();

   const tags = jsDoc.getTags();
   const isDocumentedQueryTag = tags.find(t => t.getTagName() === 'isQuery');
   if (!isDocumentedQueryTag) {
      return {
         ...commonDetails,
         isQueryFunction: false
      };
   }

   const sampleQueryParamsTag = tags.find(t => t.getTagName() === 'queryParams');
   if (!sampleQueryParamsTag) {
      return {
         ...commonDetails,
         jsDoc: fullJsDocText,
         isQueryFunction: true,
         error: "Missing @queryParams tag for this function"
      };
   }

   const sampleQueryParams = sampleQueryParamsTag.getCommentText();
   try {
      if (!sampleQueryParams) throw new Error('Missing query params');

      return {
         ...commonDetails,
         jsDoc: fullJsDocText,
         isQueryFunction: true,
         queryParams: JSON.parse(sampleQueryParams)
      }
   } catch (ex: any) {
      return {
         ...commonDetails,
         jsDoc: fullJsDocText,
         isQueryFunction: true,
         error: `Unable to JSON.parse the query function's @queryParams tag (${sampleQueryParams}); please ensure it's a proper JSON (including double quotes)`
      }
   }
}

function getFunctionTextWithoutJsDoc(func: FunctionDeclaration): string {
  const fullText = func.getFullText();
  const funcStart = func.getStart();
  const fullStart = func.getFullStart();

  const offset = funcStart - fullStart;
  return fullText.slice(offset);
}

function getFunctionDeclarations({ tsconfig, modulePath }: GetFunctionDocsParameters) {
   console.time('creating TS project');
   const project = new Project({
      tsConfigFilePath: tsconfig,
      // skipAddingFilesFromTsConfig: true,
   });
   console.timeEnd('creating TS project');

   console.time('getting source file');
   // project.addSourceFileAtPath(modulePath);
   const importedModule = project.getSourceFile(modulePath);
   if (!importedModule) {
      throw new Error(`Module "${modulePath}" does not exist!`);
   }
   console.timeEnd('getting source file');

   const targetFunctions = importedModule.getFunctions();
   if (!targetFunctions.length) {
      throw new Error(`Unable to find any functions in module "${modulePath}"`)
   }

   return targetFunctions;
}