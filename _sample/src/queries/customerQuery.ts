import { db } from '../db';

export async function customerNameQuery(limit: number) {
   const res = await db.selectFrom('Customers').select('first_name').limit(limit).execute();

   console.log('res is', res);

   return res;
}
