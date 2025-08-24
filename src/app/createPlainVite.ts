import { createServer } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths'

type Params = {
   projectRoot: string;
}

export async function createPlainVite({ projectRoot }: Params) {
   const vite = await createServer({
      mode: 'dev',
      appType: 'custom',
      root: projectRoot,
      server: {
         fs: {
            allow: [projectRoot] // Allow both dirs to resolve modules
         }
      },
      plugins: [
         tsconfigPaths()
      ]
   })

   return vite;
}