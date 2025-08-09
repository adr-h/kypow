// src/server.ts
import express from 'express';
import { type App } from './app';

export async function setupServer(app: App) {
   const server = express();

   server.get('/api/execute-module', async (req, res) => {
      const queryDetails = await app.getQuery({
         modulePath : "./src/queries/customerQuery.ts",
         functionName : 'customerNameQuery'
      })

      res.json(queryDetails)
   });

   server.use(app.vite.middlewares)

   // Serve frontend files via Express
   // TODO: serve these via Vite server as well, or HMR will not work
   // app.use('/', express.static(kypanelRoot))

   // Example: transform & serve backend modules manually

   server.listen(3000, () => console.log('Server running'));
}

