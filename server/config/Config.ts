export type Config = {
   foo: string;
   projectRoot: string;
   tsConfigPath: string;
   esBuildOptions?: any;
   moduleFormat: 'esm' | 'cjs' | 'iife';

   compileMode: {
      dbModules: [
         {
            pathToOriginalModule: string;
            pathToMockModule: string;
         }
      ]
   }
}