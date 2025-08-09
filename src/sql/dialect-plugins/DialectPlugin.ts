export type DialectPlugin = {
   name: string;
   interpolateSql: (rawSql: string, params: readonly any[] | any[]) => string;
}
