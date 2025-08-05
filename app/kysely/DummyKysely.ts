import {
  Kysely,
  MssqlAdapter,
  MssqlIntrospector,
  MssqlQueryCompiler,
  MysqlAdapter,
  MysqlIntrospector,
  MysqlQueryCompiler,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
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
      return new Kysely<S>({
        dialect: {
          createAdapter: () => new PostgresAdapter(),
          createDriver: () => new DummyDriver(),
          createIntrospector: (db) => new PostgresIntrospector(db),
          createQueryCompiler: () => new PostgresQueryCompiler(),
        },
      });
    case 'mysql':
      return new Kysely<S>({
        dialect: {
          createAdapter: () => new MysqlAdapter(),
          createDriver: () => new DummyDriver(),
          createIntrospector: (db) => new MysqlIntrospector(db),
          createQueryCompiler: () => new MysqlQueryCompiler(),
        },
      });
    case 'mssql':
      return new Kysely<S>({
        dialect: {
          createAdapter: () => new MssqlAdapter(),
          createDriver: () => new DummyDriver(),
          createIntrospector: (db) => new MssqlIntrospector(db),
          createQueryCompiler: () => new MssqlQueryCompiler(),
        },
      });
    default:
      throw new Error(`Unsupported dialect ${dialect}. Please implement your own mock`);
  }

}