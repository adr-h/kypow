import path from 'path';
import { createApp } from './app';

async function main() {
   // TODO: allow this path to be overriden
   const configPath = path.join(process.cwd(), '.kypanel', 'config.ts')
   // TODO: validate config
   const {config} = await import(configPath);

   // TODO either start server or dump
   const app = await createApp(config);
   const command = process.argv[2];

   if (command == 'dump') {
      // TOOD: get from CLI
      const modulePath = "./src/queries/customerQuery.ts";
      const functionName = 'customerNameQuery';

      // console.time('getQuery');
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

      console.log(JSON.stringify({queryDetails}, null, 2));

      queryDetails.addUpdateListener(async () => {
         console.log('Query module updated; new values:')
         const queryDetails = await app.getQuery({ modulePath, functionName });
         console.log(queryDetails);
      })
      // process.exit();
   } else {
      console.error('Unknown command: ', command);
   }
}

main();