import { DummyDriver as ActualDummyDriver, type DatabaseConnection } from "kysely";
import { DummyConnection } from "./DummyConnection";

async function dispatchEvent<T> (eventName: string, eventDetail: T) {
   console.log('Event name', eventName);
   console.log('Event detail', eventDetail);
   // const w = typeof window !== 'undefined' ? window : null;

   // return w?.dispatchEvent(
   //    new CustomEvent<typeof eventDetail>(eventName, {
   //       detail: eventDetail
   //    })
   // )
}

export class DummyDriver extends ActualDummyDriver {
   constructor() {
      super();
   }

   acquireConnection(): Promise<DatabaseConnection> {
      return Promise.resolve(new DummyConnection(dispatchEvent));
   }
}