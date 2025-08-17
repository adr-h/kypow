import path from 'path';
import { App } from './app';
import arg from 'arg';
import type { Config } from './app/Config';
import { RAW_BANNER, renderUiApp } from './ui';

async function main() {
   const chosenCommand = parseCommandFlags();
   if (chosenCommand === 'help') {
      console.log(RAW_BANNER);
      return console.log('TODO: help text');
   }

   if (chosenCommand === 'version') {
      console.log(RAW_BANNER);
      return console.log('TODO: version');
   }

   const parsedConfig = parseConfig();

   const app = new App(parsedConfig);

   renderUiApp(app);

   // TOOD: get from CLI
   // const modulePath = "./src/queries/customerQuery.ts";
   // const functionName = 'customerNameQuery';
   // const queryDetails = await app.getQuery({
   //    modulePath,
   //    functionName
   // })

   // console.log(queryDetails);

   // queryDetails.addUpdateListener(async () => {
   //    console.log('Query module updated; new values:')
   //    const queryDetails = await app.getQuery({ modulePath, functionName });
   //    console.log(queryDetails);
   // })
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
      '--queryTimeout': Number
   }, {
      permissive: true,
      argv: process.argv
   })

   const projectRoot = res['--project-root'] || process.cwd();
   const tsConfigPath = res['--tsConfig'] ? path.join(process.cwd(), res['--tsConfig']) : path.join(process.cwd(), 'tsconfig.json');
   const noExternal = res['--externalPackage'] || [];
   const queryTimeout = res['--queryTimeout'] || 20000;

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
      noExternal,
      queryTimeout
   }

   return parsedConfig;
}

main();