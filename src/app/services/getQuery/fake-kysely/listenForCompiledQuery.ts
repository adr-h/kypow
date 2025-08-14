import { randomUUID } from "crypto";
import { getQueryExecutionEmitter, isListenUntilQueryExecutedTimeout } from "./QueryExecutionEmitter";

export async function listenForCompiledQuery(callback: () => any, timeout?: number) {
   // generate a unique ID, for instance: abcd-1234-efgh-5678
   const queryExecutionId = `kypow_${randomUUID()}`;

   // execute callback() inside of a wrapperFn that's named after the unique ID.
   // this causes any stacktrace produced within callback() to include `at async kypow_abcd-1234-efgh-5678...`
   const wrapperFn = wrapWithNamedFunction(callback, queryExecutionId);

   // start listening for queryExecuted events, and only resolve if the stackTrace of the event
   // includes `at async kypow_abcd-1234-efgh-5678...`
   const listenerPromise = getQueryExecutionEmitter().listenUntilQueryExecutedEvent(
      (event, resolve) => {
         if (event.stackTrace.includes(queryExecutionId)) {
            return resolve(event);
         }
      },
      timeout
   );

   try {
      // actually run the requested callback in wrapperFn
      wrapperFn();

      // listen until wrapperFn triggers a queryExecuted event; or timeout err, whichever happens first
      const { compiledQuery } = await listenerPromise;

      return { compiledQuery };
   } catch (ex: any) {
      if (isListenUntilQueryExecutedTimeout(ex)) {
         throw new Error('Timed out waiting for a query execution. Confirm that your function actually runs db.selectFrom("something")...execute().')
      }

      throw ex;
   }
}

function wrapWithNamedFunction(f: Function, name: string) {
   const wrapperFn = async () => {
      try {
         await f()
      } catch(ex) {
         // Does not actually matter if an error occurred (e.g: because of 'executeTakeFirstOrThrow'),
         // so long as a query was triggered

         // TODO: revisit, and only ignore NoResult errors? Or is it a feature-not-bug that listenForCompiledQuery will resolve so long as it gets a query event, even if there were misc errors?
      }
   };
   Object.defineProperty(wrapperFn, 'name', { value: name });

   return wrapperFn;
}