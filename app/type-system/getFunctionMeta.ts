import * as tsj from "ts-json-schema-generator";

type GetFunctionMetaParams = {
   modulePath: string;
   functionName: string;
   tsconfig: string;
}

type FunctionMeta = {
   name: string;
   description: string;
   params: ParameterMeta[];
   sampleParams: any[];
}

type ParameterMeta = {
   name: string;
   type: string;
   description: string;
}

export async function getFunctionMeta(params: GetFunctionMetaParams): Promise<FunctionMeta> {
   const { modulePath, functionName, tsconfig } = params;

   const functionSchema = getFunctionSchema({modulePath, functionName, tsconfig});

   return {
      name: params.functionName,
      description: functionSchema.$comment || '',
      params: [], // TODO
      sampleParams: [] // TODO
   };
}

function getFunctionSchema(params: GetFunctionMetaParams) {
   const { modulePath, functionName, tsconfig } = params;

   // TODO: tsj does not properly process tsconfig.json files that look like this:
   // "references": [
   //     { "path": "./tsconfig.src.json" },
   //     { "path": "./tsconfig.app.json" }
   //   ]
   // so we need to resolve for that based on modulePath, eventually
   const schema = tsj.createGenerator({
      path: modulePath,
      tsconfig: tsconfig,
      skipTypeCheck: true,
      sortProps: false
   }).createSchema(functionName);

   const definitions = schema.definitions;
   if (!definitions) {
      throw new Error(`Unable to find exports in module ${modulePath}`)
   }

   const targetFunction = definitions[functionName];
   if (typeof targetFunction !== 'object') {
      throw new Error(`Function ${functionName} not found in module ${modulePath}`);
   }

   return targetFunction
}