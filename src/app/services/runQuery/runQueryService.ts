import type { ViteDevServer } from "vite";

type GetQueryParams = {
   modulePath: string;
   functionName: string;
   functionParams?: any[];
   vite: ViteDevServer;
}
export async function runQueryService({modulePath, functionName, functionParams = [], vite}: GetQueryParams) {
   const module = await vite.ssrLoadModule(modulePath);
   let result = await module[functionName](...functionParams);

   return {
      result
   }
}