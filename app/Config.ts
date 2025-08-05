import type { DialectPlugin, RecognisedDialects } from "./sql";

export type Config = {
   foo: string;
   projectRoot: string;
   dialect: RecognisedDialects | DialectPlugin;
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