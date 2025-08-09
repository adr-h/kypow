import type { DialectPlugin, RecognisedDialects } from "./sql";

export type Config = {
   foo: string;
   projectRoot: string;
   dialect: RecognisedDialects | DialectPlugin;
   tsConfigPath: string;
   esBuildOptions?: any;
   moduleFormat: 'esm' | 'cjs' | 'iife';

   // if your Kysely instance is being created by another node package (e.g: "import { db } from bar"), you will need to add that package to this list
   noExternal?: string[],

   // TODO
   // sourcePaths?: string[],
   // excludePaths?: string[]
}