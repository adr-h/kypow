import { getFunctionParameters } from './poc/getFunctionParameters';


getFunctionParameters({
   modulePath: 'app/type-system/tempSample.ts',
   functionName: 'sampleFunction',
   tsconfig: '/home/adrian/Code/kypanel/tsconfig.app.json'
});
