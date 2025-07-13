import { MssqlPlugin, MySqlPlugin, PostgresPlugin, SqlitePlugin, type DialectPlugin } from "./dialect-plugins";
import type { RecognisedDialects } from "./RecognisedDialects";


export function resolveDialectPlugin(dialect: RecognisedDialects | DialectPlugin) {
   if (dialect === 'mysql') {
      return MySqlPlugin;
   }

   if (dialect === 'mssql') {
      return MssqlPlugin;
   }

   if (dialect === 'postgres') {
      return PostgresPlugin;
   }

   if (dialect === 'sqlite') {
      return SqlitePlugin;
   }

   // if we've reached this point, it's most likely a custom dialect plugin, let it through
   return dialect;
}