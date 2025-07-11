import type { CompiledQuery } from "kysely";
import EventEmitter from "node:events";

type QueryExecutedEventProps = { compiledQuery: CompiledQuery, stackTrace: string };
type EventMap = {
   'queryExecuted': [QueryExecutedEventProps];
}

type ListenUntilQueryExecutedCallback = (
   props: QueryExecutedEventProps,
   resolve: (a: QueryExecutedEventProps) => void,
   reject: (a: any) => void
) => void

export const ErrorCode = {
   Timeout: '__KYPANEL_LISTEN_UNTIL_QUERY_EXECUTED_TIMEOUT__'
} as const;

export function isListenUntilQueryExecutedTimeout (err: any) {
   return err.message === ErrorCode.Timeout;
}

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

   async listenUntilQueryExecutedEvent(callback: ListenUntilQueryExecutedCallback, timeout = 5000): Promise<QueryExecutedEventProps> {
      return new Promise((resolve, reject) => {
         const emitter = getQueryExecutionEmitter();

         const listener = ({ stackTrace, compiledQuery }: QueryExecutedEventProps) => {
            console.log('event received');
            callback({ stackTrace, compiledQuery }, resolve, reject);
         };

         emitter.on('queryExecuted', listener);

         setTimeout(() => {
            emitter.off('queryExecuted', listener);
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

