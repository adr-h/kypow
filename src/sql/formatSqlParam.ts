function escapeStringValue (value: string) {
   return  value.replace(/'/g, "''");
}

// This is definitely not going to handle all scenarios. Come back and reconsider this :(
export function formatSqlParam(value: any): string {
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