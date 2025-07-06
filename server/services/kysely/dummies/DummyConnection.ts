import type { CompiledQuery, DatabaseConnection } from "kysely";

export class DummyConnection implements DatabaseConnection {
   constructor() {}

   executeQuery(compiledQuery: CompiledQuery) {
      const res: any = {
         [Symbol.for('kypanelCompiledQuery')]: compiledQuery
      };

      return Promise.resolve({
         rows: [res]
      });
   }

   streamQuery(
      compiledQuery: CompiledQuery,
      _chunkSize?: number | undefined,
   ) {
      const res: any = {
         [Symbol.for('kypanelCompiledQuery')]: compiledQuery
      };

      return (async function*() {
         yield {
            rows: [res],
         };
      })();
  }
}

