// TODO: this file should be generated, so we can:
// - inject the Schema type
// - select the right dialect
import {
  Kysely,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'kysely'
import { DummyDriver } from './DummyDriver';
import type { RecognisedDialects } from '../sql';

type CreateDummyKyselyFactoryParams = {
  dialect: RecognisedDialects;
}

/**
 * Factory to create Kysely instances with dummy drivers
 * <S = void> to allow for optional generic; not sure if the typing for the dummy will be used for much anyway
 */
export function createDummyKysely<S = void>({ dialect }: CreateDummyKyselyFactoryParams) {
  switch(dialect) {
    case 'sqlite':
      return new Kysely<S>({
        dialect: {
          createAdapter: () => new SqliteAdapter(),
          createDriver: () => new DummyDriver(),
          createIntrospector: (db) => new SqliteIntrospector(db),
          createQueryCompiler: () => new SqliteQueryCompiler(),
        },
      });
    case 'postgres':
    case 'mysql':
    case 'mssql':
    default:
      throw new Error(`Unsupported dialect ${dialect}. Please implement your own mock`);
  }

}