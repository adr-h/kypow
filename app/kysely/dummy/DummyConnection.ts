import type { CompiledQuery, DatabaseConnection } from "kysely";
import { getQueryExecutionEmitter } from "./QueryExecutionEmitter";

export class DummyConnection implements DatabaseConnection {
   constructor() {}

   executeQuery(compiledQuery: CompiledQuery) {
      getQueryExecutionEmitter().emitQueryExecuted(compiledQuery);

      return Promise.resolve({
         rows: [],
         // rows: injectHiddenValue([{}], compiledQuery)
      });
   }

   streamQuery(
      compiledQuery: CompiledQuery,
      _chunkSize?: number | undefined,
   ) {
      getQueryExecutionEmitter().emitQueryExecuted(compiledQuery);

      return (async function*() {
         yield {
            rows: []
            // rows: [{} as any],
         };
      })();
  }
}

