import type { RecognisedDialects } from "../sql";

export type Config = {
   foo: string;
   projectRoot: string;
   dialect: RecognisedDialects;
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