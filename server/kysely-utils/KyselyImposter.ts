export * from 'kysely';
import { Kysely as ActualKysely } from 'kysely';

type ConstructorArgs<T> = ConstructorParameters<typeof ActualKysely<T>>;

class KyselyImposter<T> extends ActualKysely<T> {
   constructor(...args: ConstructorArgs<T>) {
      console.log("Kysely instance created with args:", args);
      super(...args);
  }
;}

export { KyselyImposter as Kysely }

