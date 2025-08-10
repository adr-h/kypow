import { createServer } from 'vite';
import { redirectPackageImportPlugin } from '../lib/vite/redirectPackageImportPlugin';

type Params = {
   projectRoot: string;
   kypanelRoot: string;
   kyselyImposterModule: string;
   noExternal?: string[];
}

export async function createViteWithKyselyImposter({
   projectRoot, kypanelRoot, kyselyImposterModule, noExternal = []
}: Params) {
   const vite = await createServer({
      mode: 'dev',
      appType: 'custom',
      root: projectRoot, // Working directory is Vite's root
      ssr: {
         noExternal:  ['kysely', ...noExternal]
      },
      server: {
         fs: {
            allow: [projectRoot, kypanelRoot] // Allow both dirs to resolve modules
         }
      },
      plugins: [
         redirectPackageImportPlugin({
            packageName: 'kysely',
            mockPath: kyselyImposterModule
         })
      ]
   })

   return vite;
}