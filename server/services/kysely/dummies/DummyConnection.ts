import type { CompiledQuery, DatabaseConnection } from "kysely";

export class DummyConnection implements DatabaseConnection {

   constructor() {
   }

   executeQuery(compiledQuery: CompiledQuery) {
      return Promise.resolve({
         rows: [],
         [Symbol.for('kypanelCompiledQuery')]: compiledQuery
      });
   }

   streamQuery(
      compiledQuery: CompiledQuery,
      _chunkSize?: number | undefined,
   ) {
      return (async function*() {
         yield {
            rows: [],
            [Symbol.for('kypanelCompiledQuery')]: compiledQuery
         };
      })();
  }
}

