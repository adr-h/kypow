import { createServer } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths'
import { redirectPackageImportPlugin } from '../lib/vite/redirectPackageImportPlugin';

type Params = {
   projectRoot: string;
   kypowRoot: string;
   kyselyImposterModule: string;
   noExternal?: string[];
}

export async function createViteWithKyselyImposter({
   projectRoot, kypowRoot, kyselyImposterModule, noExternal = []
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
            allow: [projectRoot, kypowRoot] // Allow both dirs to resolve modules
         }
      },
      plugins: [
         redirectPackageImportPlugin({
            packageName: 'kysely',
            mockPath: kyselyImposterModule
         }),
         tsconfigPaths()
      ]
   })

   return vite;
}