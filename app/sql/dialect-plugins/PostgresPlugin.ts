import { formatSqlParam } from "../formatSqlParam";
import type { DialectPlugin } from "./DialectPlugin";

export const PostgresPlugin: DialectPlugin = {
   name: 'postgres',
   interpolateSql(rawSql: string, queryParams: any[] | readonly any[]) {
      const matcher = /\$\d+/;

      let finalSql = rawSql;
      for (const param of queryParams) {
         finalSql = finalSql.replace(matcher, formatSqlParam(param));
      }

      return finalSql;
   }
}