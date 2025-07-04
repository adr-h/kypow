// TODO: this file should be generated, so we can:
// - inject the Schema type
// - select the right dialect
import { type DB as Schema } from './dbImposterSchema';
import {
  Kysely,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'kysely'
import { DummyDriver } from './DummyDriver';

export const db = new Kysely<Schema>({
  dialect: {
    createAdapter: () => new SqliteAdapter(),
    createDriver: () => new DummyDriver(),
    createIntrospector: (db) => new SqliteIntrospector(db),
    createQueryCompiler: () => new SqliteQueryCompiler(),
  },
});

// db.selectFrom('Customers').select('last_name').execute().then((res) => {
//    console.log('ooga');
//    console.log(res);
// });
