import path from 'path';
import { createApp } from './app';
import { setupServer } from './server';

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

      const queryDetails = await app.getQuery({
         modulePath,
         functionName
      })

      console.log(JSON.stringify(queryDetails, null, 2));
      process.exit();
   } else if (command == 'serve') {
      setupServer(app)
   } else {
      console.error('Unknown command: ', command);
   }
}

main();