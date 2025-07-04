import type { monaco as Monaco } from "../loader";
import type {getTypedefs} from '../../../server/services/type-system';

type GetTypeDefResult = ReturnType<typeof getTypedefs>

export async function registerKysely(monaco: typeof Monaco) {
   const res = await fetch('/typedefs?path=@kypanel/node_modules/kysely/dist/esm&root=file:///node_modules/kysely');
   const typedefs = await (res.json() as GetTypeDefResult);

   for (const typedef of typedefs) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(typedef.content, typedef.path)
   }

   monaco.languages.typescript.typescriptDefaults.addExtraLib(`
      export interface Fiz {
         email: string;
         first_name: string;
         last_name: string;
      }
   }`, 'file:///node_modules/fiz/index.ts');
}