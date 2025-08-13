import path from 'path';
import { App } from './app';
import arg from 'arg';
import type { Config } from './app/Config';
import { banner } from './cliBanner';
import { renderRoot } from './ui/Root';

async function main() {
   console.log(banner)

   const chosenCommand = parseCommandFlags();
   if (chosenCommand === 'help') {
      return console.log('TODO: help text');
   }

   if (chosenCommand === 'version') {
      return console.log('TODO: version');
   }

   const parsedConfig = parseConfig();

   const app = new App(parsedConfig);
   renderRoot(app);

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
   }, {
      permissive: true,
      argv: process.argv
   })

   const projectRoot = res['--project-root'] || process.cwd();
   const tsConfigPath = res['--tsConfig'] ? path.join(process.cwd(), res['--tsConfig']) : path.join(process.cwd(), 'tsconfig.json');
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