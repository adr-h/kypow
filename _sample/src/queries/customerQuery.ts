import { db, dbIsOk } from '../db';
import { sql } from 'kysely';
export const sampleConst = "this is a sample export";

export async function customerNameQuery(name: string, limit: number) {
   const res = await db.selectFrom('Customers')
      .select('first_name')
      .where('first_name', '==', name)
      .limit(limit).execute();

   console.log('db status', dbIsOk);
   console.log('res is', res, );

   return res;
}
