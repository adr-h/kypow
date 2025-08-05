import { getFunctionMeta } from './getFunctionMeta';

// getFunctionParameters({
//    modulePath: 'app/type-system/tempSample.ts',
//    functionName: 'sampleFunction',
//    // functionName: 'paramlessFunction',
//    tsconfig: '/home/adrian/Code/kypanel/tsconfig.app.json'
// });


console.log(
   JSON.stringify(
      await getFunctionMeta({
         modulePath: 'app/type-system/tempSample.ts',
         tsconfig: '/home/adrian/Code/kypanel/tsconfig.app.json',
         functionName: 'sampleFunction',
         // functionName: 'paramlessFunction',
         // functionName: 'Foo'
      }),
      null,
      2
   )
)