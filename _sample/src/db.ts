import SQLite from 'better-sqlite3'
import { Kysely, SqliteDialect } from "kysely";
// import { createDatabaseIfNotExists } from './createDbIfNotExists';
import { fileURLToPath } from 'url';
import path from 'path';
import { DB } from './schema';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const dbPath = path.join(__dirname, 'db.sqlite');

export const db = new Kysely<DB>({
   dialect: new SqliteDialect({
      database: new SQLite(dbPath),
   })
});

export const dbIsOk = 'DB STATUS: maybe';
