import { DummyDriver as ActualDummyDriver, type DatabaseConnection } from "kysely";
import { DummyConnection } from "./DummyConnection";

export class DummyDriver extends ActualDummyDriver {
   constructor() {
      console.log('Dummy driver initialised');
      super();
   }

   acquireConnection(): Promise<DatabaseConnection> {
      return Promise.resolve(new DummyConnection());
   }
}