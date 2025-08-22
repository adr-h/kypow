export type QueryMeta = {
   name: string,
   description: string,
   sql: string,
   interpolatedSql: string,
   paramsUsed: any[]
}