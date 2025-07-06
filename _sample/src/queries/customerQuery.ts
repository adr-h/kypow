import { db, dbIsOk } from '../db';

export async function customerNameQuery(limit: number) {
   const res = await db.selectFrom('Customers').select('first_name').limit(limit).execute();

   console.log('db status', dbIsOk);
   console.log('res is', res, );

   return res;
}
