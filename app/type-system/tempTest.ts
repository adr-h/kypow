import { getFunctionDocs } from './poc/getFunctionJsDocs';
import { getQueryFunctionsDetails } from './getQueryFunctionsDetails';
import { getFunctionParameters } from './poc/json-schema/getFunctionParameters';


// getFunctionParameters({
//    modulePath: 'app/type-system/tempSample.ts',
//    functionName: 'sampleFunction',
//    // functionName: 'paramlessFunction',
//    tsconfig: '/home/adrian/Code/kypanel/tsconfig.app.json'
// });

getQueryFunctionsDetails({
   modulePath: 'app/type-system/tempSample.ts',
   // functionName: 'sampleFunction',
   // functionName: 'paramlessFunction',
   tsconfig: '/home/adrian/Code/kypanel/tsconfig.app.json'
})