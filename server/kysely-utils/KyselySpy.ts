export * from 'kysely';
import { Kysely as ActualKysely } from 'kysely';

type ConstructorArgs<T> = ConstructorParameters<typeof ActualKysely<T>>;

class KyselySpy<T> extends ActualKysely<T> {
   constructor(...args: ConstructorArgs<T>) {
      console.log("Kysely instance created with args:", args);
      super(...args);
      // Optional: extend, wrap, override methods here
  }
   // selectFrom(){
   //  //TODO: proxy
   // }

   // selectNoFrom() {
   //  // TODO: proxy
   // }

   // executeQuery() {
   //    // TODO: proxy
   // }
;}

export { KyselySpy as Kysely }

