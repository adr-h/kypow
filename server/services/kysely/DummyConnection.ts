import type { CompiledQuery, DatabaseConnection } from "kysely";


type Dispatcher = <T>(eventName: string, eventDetail: T) => Promise<void>;

export class DummyConnection implements DatabaseConnection {
   private dispatchEvent: Dispatcher;

   constructor(dispatcher: Dispatcher) {
      this.dispatchEvent = dispatcher;
   }

   executeQuery(compiledQuery: CompiledQuery) {
      this.dispatchEvent("executeQuery", { detail: compiledQuery});

      return Promise.resolve({ rows: [] });
   }

   streamQuery(
      compiledQuery: CompiledQuery,
      chunkSize?: number | undefined,
   ) {
      this.dispatchEvent("streamQuery", { compiledQuery, chunkSize });

      return (async function*() {
         yield { rows: [] };
      })();
  }
}

