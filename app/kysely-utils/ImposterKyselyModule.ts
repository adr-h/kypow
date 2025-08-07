export * from 'kysely';
import { Kysely as ActualKysely } from 'kysely';
import { DummyDriver } from './DummyDriver';

type ConstructorArgs<T> = ConstructorParameters<typeof ActualKysely<T>>;

class KyselyImposter<T> extends ActualKysely<T> {
   constructor([arg]: ConstructorArgs<T>) {
      const dialectWithDummyDriver = {
            ...arg.dialect,
            createDriver: () => new DummyDriver()
      };

      super({
         ...arg,
         dialect: dialectWithDummyDriver
      })
   }
}

export { KyselyImposter as Kysely }
