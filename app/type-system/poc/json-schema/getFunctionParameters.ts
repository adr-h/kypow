import * as tsj from "ts-json-schema-generator";
import type {
   Schema as JsonSchema7
} from "ts-json-schema-generator";


type GetFunctionParametersParameters = {
   modulePath: string;
   functionName: string;
   tsconfig: string;
}

// Note: leveraging ts-json-schema-generator temporarily while I work on the ts-morph based ./poc solution
// ts-json-schema-generator based solution currently takes 2+++ seconds on average for the tempSample.ts,
// which is relatively small and self-contained. Unclear if this will scale for larger packages...
export function getFunctionParameters({ tsconfig, modulePath, functionName}: GetFunctionParametersParameters) {
   console.time('getFunctionParameters - ts-json-schema version')

   const parameterSchemas = getParameterJsonSchemas({ tsconfig, modulePath, functionName });

   console.log('jsonSchema', JSON.stringify(parameterSchemas, null, 2));

   console.timeEnd('getFunctionParameters - ts-json-schema version')
   // console.log('schema', schemaString);
}

function getParameterJsonSchemas({ tsconfig, modulePath, functionName}: GetFunctionParametersParameters) {
   // TODO: tsj does not properly process tsconfig.json files that look like this:
   // "references": [
   //     { "path": "./tsconfig.src.json" },
   //     { "path": "./tsconfig.app.json" }
   //   ]
   // so we need to resolve for that based on modulePath, eventually
   const config = {
      path: modulePath,
      tsconfig: tsconfig,
      // type: functionName,
      skipTypeCheck: true
   };

   const schema = tsj.createGenerator(config).createSchema(functionName);

   const definitions = schema.definitions;
   if (!definitions) {
      throw new Error(`Unable to find exports in module ${modulePath}`)
   }

   const targetFunction = definitions[functionName];
   if (!targetFunction || typeof targetFunction !== 'object') {
      throw new Error(`Function ${functionName} not found in module ${modulePath}`);
   }

   if (
      typeof targetFunction.properties?.namedArgs !== 'object' ||
      typeof targetFunction.properties?.namedArgs.properties !== 'object'
   ) {
      return [];
   }

   const requiredParams =  targetFunction.properties.namedArgs.required || [];

   const functionParams = Object.entries(targetFunction.properties.namedArgs.properties)
                           .filter(
                              (entry): entry is [name: string, schema: JsonSchema7] => typeof entry[1] !== 'boolean'
                           )
                           .map(([name, schema]) => ({
                              name,
                              schema,
                              isRequired: requiredParams.includes(name) || false
                           }));

   return functionParams;
}

// for some reason, ts-json-schema-generator seems to have typedefs that assume that schema definitions
// can either be JsonSchema OR a boolean?? I have no idea why, but I will trust that
// their types are accurate and handle for this case
function isJsonSchema(definition: JsonSchema7 | boolean): definition is JsonSchema7 {
   return typeof definition !== 'boolean';
}
