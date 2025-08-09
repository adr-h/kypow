import * as tsj from "ts-json-schema-generator";
import { JSONSchemaFaker }  from 'json-schema-faker';

type GetFunctionMetaParams = {
   modulePath: string;
   functionName: string;
   tsconfig: string;
}

type FunctionMeta = {
   name: string;
   description: string;
   params: ParameterMeta[];
}
export async function getFunctionMeta(params: GetFunctionMetaParams): Promise<FunctionMeta> {
   const { modulePath, functionName, tsconfig } = params;

   const functionSchema = getFunctionSchema({modulePath, functionName, tsconfig});
   const parameterMeta = getParamMetaFromJsonSchema(functionSchema);

   return {
      name: params.functionName,
      description: functionSchema.$comment || '',
      params: parameterMeta,
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


type ParameterMeta = {
   name: string;
   type: string;
   description: string;
   sample: any;
}
function getParamMetaFromJsonSchema(functionSchema: ReturnType<typeof getFunctionSchema>): ParameterMeta[] {
   const namedArgs = functionSchema.properties?.namedArgs;
   if ( typeof namedArgs === 'boolean' || !namedArgs ) {
      throw new Error('what the heck is this man');
   }

   const argProperties = namedArgs.properties;
   if ( typeof argProperties === 'boolean' || !argProperties ) {
      throw new Error('what the heck is this man');
   }

   const output = Object.entries(argProperties).map(([name, property]) => ({
      name,
      type: property.type as string,
      description: property.description as string, // the typing
      sample: JSONSchemaFaker.generate( property )
   }))

   return output;
}
