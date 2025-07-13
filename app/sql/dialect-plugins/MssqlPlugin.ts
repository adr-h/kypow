import { formatSqlParam } from "../formatSqlParam";
import type { DialectPlugin } from "./DialectPlugin";

export const MssqlPlugin: DialectPlugin = {
   name: 'mssql',
   interpolateSql(rawSql: string, queryParams: any[]) {
      const matcher = /@\d+/;

      let finalSql = rawSql;
      for (const param of queryParams) {
         finalSql = finalSql.replace(matcher, formatSqlParam(param));
      }

      return finalSql;
   }
}