import type { CompiledQuery } from "kysely";
import EventEmitter from "node:events";

type QueryExecutedEventProps = { compiledQuery: CompiledQuery, stackTrace: string };
type EventMap = {
   'queryExecuted': [QueryExecutedEventProps];
}

export const ErrorCode = {
   Timeout: 'TIMEOUT_ERR'
} as const;

class QueryExecutionEmitter extends EventEmitter<EventMap> {
   constructor() {
      console.log('Initialised once')
      super();
   }

   emitQueryExecuted(compiledQuery: CompiledQuery) {
      console.log('emitting events');
      this.emit('queryExecuted', {
         compiledQuery,
         stackTrace: new Error().stack || ''
      });
   }

   async onceQueryExecuted({ timeout } = { timeout: 5000 }): Promise<QueryExecutedEventProps> {
      return new Promise((resolve, reject) => {
         const emitter = getQueryExecutionEmitter();

         emitter.once('queryExecuted', ({ stackTrace: stack, compiledQuery}) => {
            console.log('event received');
            resolve({ stackTrace: stack, compiledQuery});
         });

         setTimeout(() => {
            reject(ErrorCode.Timeout);
         }, timeout);

      });
   }
}

export function getQueryExecutionEmitter(): QueryExecutionEmitter {
   if (!(globalThis as any).kypanelQueryExectionEmitter) {
      (globalThis as any).kypanelQueryExectionEmitter = new QueryExecutionEmitter();
   };

   return (globalThis as any).kypanelQueryExectionEmitter
}

