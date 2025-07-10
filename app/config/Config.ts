export type Config = {
   foo: string;
   projectRoot: string;
   tsConfigPath: string;
   esBuildOptions?: any;
   moduleFormat: 'esm' | 'cjs' | 'iife';

   mocks: [
      {
         pathToOriginalModule: string;
         pathToMockModule: string;
      }
   ]
}