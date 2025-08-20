// TODO: this is a very heavy operation, as `ts-json-schema-generator` is
// rebuilding the TS Program every single time this is called. Come back and reoptimise this
// the way the output from tsj had to be cludged to fit into JSONSchemaFaker is also potentially very brittle.
// if we have the time, rewrite this entirely.

// TODO: this does not currently support queryFunctions that have no params at all [e.g: () => {}]
// it will error out; need to fix this.

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
   functionArgsSchema: ReturnType<typeof getArgumentsSchema>;
   sampleParams: any[]
}

/**
 * @deprecated
 * @param params
 * @returns
 */
export async function getFunctionMeta(params: GetFunctionMetaParams): Promise<FunctionMeta> {
   const { modulePath, functionName, tsconfig } = params;

   const {functionSchema, otherSchemas} = getFunctionSchema({modulePath, functionName, tsconfig});
   const functionArgsSchema = getArgumentsSchema(functionSchema);

   const sampleParams = await getSampleParams(functionArgsSchema, otherSchemas);

   return {
      name: functionName,
      description: functionSchema.$comment || '',
      functionArgsSchema,
      sampleParams
   };
}

// TODO: typing spaghetti
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
      sortProps: false,
   }).createSchema(functionName);

   const definitions = schema.definitions;
   if (!definitions) {
      throw new Error(`Unable to find exports in module ${modulePath}`)
   }

   const {
      [functionName]: functionSchema,
      ...otherSchemas
   } = definitions;
   if (typeof functionSchema !== 'object') {
      throw new Error(`Function ${functionName} not found in module ${modulePath}`);
   }

   return {functionSchema, otherSchemas}
}

// TODO: typing spaghetti
function getArgumentsSchema(functionSchema: any) {
   const namedArgs = functionSchema.properties?.namedArgs;
   if ( typeof namedArgs === 'boolean' || !namedArgs ) {
      //  Why do the TSJ typehints all think its possible for this to just randomly be bool?????????
      throw new Error('what the heck is this man');
   }

   const argProperties = namedArgs.properties;
   if ( typeof argProperties === 'boolean' || !argProperties ) {
      //  Why do the TSJ typehints all think its possible for this to just randomly be bool?????????
      throw new Error('what the heck is this man.');
   }

   return argProperties;
}

// TODO: typing spaghetti
async function getSampleParams(schema: any, definitions?: any): Promise<any[]> {
   const { functionParams } = JSONSchemaFaker.generate({
      functionParams: schema,
      definitions
   }) as any;

   return Object.values(functionParams);
}
