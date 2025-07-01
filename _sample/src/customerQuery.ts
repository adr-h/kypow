import { db } from './db';

export async function customerQuery() {
   const res = await db.selectFrom('Customers').select('first_name').executeTakeFirst();

   console.log('res is', res);

   return;
}

customerQuery();