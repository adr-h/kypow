import { formatSqlParam } from "../formatSqlParam";
import type { DialectPlugin } from "./DialectPlugin";

export const SqlitePlugin: DialectPlugin = {
   name: 'sqlite',
   interpolateSql(rawSql: string, queryParams: any[]) {
      const matcher = /\?/;

      let finalSql = rawSql;
      for (const param of queryParams) {
         finalSql = finalSql.replace(matcher, formatSqlParam(param));
      }

      return finalSql;
   }
}