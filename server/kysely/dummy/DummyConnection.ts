import type { CompiledQuery, DatabaseConnection } from "kysely";

// absolute war crime. It might be a good idea to wire up some kind of event system. but for now ...
function injectHiddenValue(input: object | any[], hiddenValue: any) {
   if (Array.isArray(input)) {
      const output: any = input.map(i => injectHiddenValue(i, hiddenValue));
      output[Symbol.for("kypanelCompiledQuery")] = hiddenValue;
      return output;
   }

   const output: any = { ...input };
   output[Symbol.for("kypanelCompiledQuery")] = hiddenValue;
   return output;
}

export class DummyConnection implements DatabaseConnection {
   constructor() {}

   executeQuery(compiledQuery: CompiledQuery) {
      return Promise.resolve({
         rows: injectHiddenValue([{}], compiledQuery)
      });
   }

   streamQuery(
      compiledQuery: CompiledQuery,
      _chunkSize?: number | undefined,
   ) {

      return (async function*() {
         yield {
            rows: [{} as any],
         };
      })();
  }
}

