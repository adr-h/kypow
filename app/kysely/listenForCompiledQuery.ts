import { randomUUID } from "crypto";
import { getQueryExecutionEmitter, isListenUntilQueryExecutedTimeout } from "./QueryExecutionEmitter";
import { CompiledQuery } from "kysely";

export async function listenForCompiledQuery(callback: () => any, timeout = 5000) {
   // generate a unique ID, for instance: abcd-1234-efgh-5678
   const queryExecutionId = `kypanel_${randomUUID()}`;

   // execute callback() inside of a wrapperFn that's named after the unique ID.
   // this causes any stacktrace triggered within callback() to include `at async kypanel_abcd-1234-efgh-5678...`
   const wrapperFn = async () => { await callback(); };
   Object.defineProperty(wrapperFn, 'name', { value: queryExecutionId });

   // start listening for queryExecuted events,
   // and only resolve if the stackTrace of the event includes `at async kypanel_abcd-1234-efgh-5678...`
   const listenerPromise = getQueryExecutionEmitter().listenUntilQueryExecutedEvent(
      (event, resolve) => {
         if (event.stackTrace.includes(queryExecutionId)) {
            return resolve(event);
         }
      },
      5000
   );

   try {
      // actually run the requested callback in wrapperFn
      wrapperFn();

      // listen until wrapperFn triggers a queryExecuted event; or timeout err, whichever happens first
      const listenerResult = await listenerPromise;

      return {
         compiledQuery: listenerResult.compiledQuery
      };
   } catch (ex: any) {
      if (isListenUntilQueryExecutedTimeout(ex)) {
         throw new Error('Timed out waiting for a query execution. Confirm that your function actually executes db...execute(), and that you have mocked your DB instance per the documentation.')
      }

      throw ex;
   }
}