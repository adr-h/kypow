import path from 'path';
import { App } from './app';
import type { Config } from './app/Config';
import arg from 'arg';


async function main() {
   const chosenCommand = parseCommandFlags();
   if (chosenCommand === 'help') {
      return console.log('TODO: help text');
   }

   if (chosenCommand === 'version') {
      return console.log('TODO: version');
   }

   const parsedConfig = parseConfig();

   // TODO either start server or dump
   const app = new App(parsedConfig);

   // TOOD: get from CLI
   const modulePath = "./src/queries/customerQuery.ts";
   const functionName = 'customerNameQuery';
   const queryDetails = await app.getQuery({
      modulePath,
      functionName
   })
   // console.timeEnd('getQuery');

   // console.time('getQueryModules');
   // const queryModules = await app.listModulesWithQueries();
   // console.timeEnd('getQueryModules');

   // console.time('listQueriesInModule');
   // const queriesInModule = await app.listQueriesInModule({ modulePath })
   // console.timeEnd('listQueriesInModule');

   console.log(queryDetails);

   queryDetails.addUpdateListener(async () => {
      console.log('Query module updated; new values:')
      const queryDetails = await app.getQuery({ modulePath, functionName });
      console.log(queryDetails);
   })
}


function parseCommandFlags(): 'help' | 'version' | 'run' {
   const res = arg({
      '--help': Boolean,
      '--version': Boolean,
   }, {
      permissive: true,
      argv: process.argv
   })

   if (res['--help']) {
      return 'help';
   }

   if (res['--version']) {
      return 'version';
   }

   return 'run';
}

function parseConfig(): Config {
   const res = arg({
      // Types
      '--project-root': String,
      '--dialect': String,
      '--tsConfig': String,
      '--moduleType': String,
      '--externalPackage': [String],
   }, {
      permissive: true,
      argv: process.argv
   })

   const projectRoot = res['--project-root'] || process.cwd();
   const tsConfigPath = res['--tsConfig'] || path.join(process.cwd(), 'tsconfig.json')
   const noExternal = res['--externalPackage'] || [];

   const dialect = res['--dialect'];
   if (
      dialect !== 'postgres' &&
      dialect !== 'mysql' &&
      dialect !== 'mssql' &&
      dialect !== 'sqlite'
   ) {
      throw new Error(`Unrecognised --dialect flag ${dialect}`)
   }

   const moduleFormat = res['--moduleType'];
   if (
      moduleFormat !== 'esm' &&
      moduleFormat !== 'cjs'
   ) {
      throw new Error(`Unrecognised --moduleType flag ${moduleFormat}`);
   }

   const parsedConfig: Config = {
      projectRoot,
      dialect,
      tsConfigPath,
      moduleFormat,
      noExternal
   }

   return parsedConfig;
}

main();