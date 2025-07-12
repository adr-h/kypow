import type { RecognisedDialects } from "./RecognisedDialects";

// Unfortunately, query builders like Kysely and Knex _always_ produce parametized queries
// and pass them on to underlying DB drivers (e.g: "pg" package, bettersqlite3, etc) to actually
// craete the raw queries. This leaves us with the unlucky task to actually interpolate the SQL query ourselves.
// Yuck. Possibly very fragile. Is not exhaustive. But it will work for now...
export function interpolateSql(rawSql: string, queryParams: any[], dialect: RecognisedDialects) {
   let finalSql = rawSql;
   const matcher = getMatcher(dialect);

   for (const param of queryParams) {
      finalSql = finalSql.replace(matcher, formatSqlParam(param));
   }
   return finalSql;
}

function getMatcher(dialect: RecognisedDialects) {
   if (dialect === 'sqlite' || dialect === 'mysql') {
      // Question Mark (`?`)
      return /\?/;
   }

   if (dialect === 'postgres') {
      // Positional with dollar sign (`$1`, `$2`)
      return /\$\d+/;
   }

   if (dialect === 'mssql') {
      // Positional with @ prefix (@1, @2, @3)
      return /@\d+/;
   }

   throw new Error(`Unable to create matcher for unrecognised dialect ${dialect}`);
}

function escapeStringValue (value: string) {
   return  value.replace(/'/g, "''");
}

function formatSqlParam(value: any): string {
   if (value === null || typeof value === 'undefined') {
      return 'NULL';
   }

   if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
   }

   if (typeof value === 'number') {
      return String(value);
   }

   if (typeof value === 'string') {
      return `'${escapeStringValue(value)}'`;
   }

   if (value instanceof Date) {
      // Formats to 'YYYY-MM-DD HH:MI:SS' which is broadly compatible
      const isoString = value.toISOString();
      return `'${isoString.slice(0, 10)} ${isoString.slice(11, 19)}'`;
   }

   return `'${escapeStringValue(String(value))}'`
}