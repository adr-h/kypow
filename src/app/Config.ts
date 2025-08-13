import type { RecognisedDialects } from "../lib/sql";

export type Config = {
   projectRoot: string;
   dialect: RecognisedDialects;
   tsConfigPath: string;
   moduleFormat: 'esm' | 'cjs';
   queryTimeout: number;

   // if your Kysely instance is being created by another node package (e.g: "import { db } from bar"), you will need to add that package to this list
   noExternal?: string[],


   // TODO
   // esBuildOptions?: any;
   // sourcePaths?: string[],
   // excludePaths?: string[]
}