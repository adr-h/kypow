import { createServer } from 'vite';
import { redirectPackageImport } from './redirectPackageImport';

type Params = {
   projectRoot: string;
   kypanelRoot: string;
   fakeKyselyPath: string;
}

export async function createMockingViteServer({
   projectRoot, kypanelRoot, fakeKyselyPath
}: Params) {
   const vite = await createServer({
      appType: 'custom',
      root: projectRoot, // Working directory is Vite's root
      ssr: {
         noExternal:  ['kysely']
      },
      server: {
         middlewareMode: true,
         fs: {
            allow: [projectRoot, kypanelRoot] // Allow both dirs to resolve modules
         }
      },
      plugins: [
         redirectPackageImport({
            packageName: 'kysely',
            mockPath: fakeKyselyPath
         })
      ]
   })

   return vite;
}