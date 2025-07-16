import { db, dbIsOk } from '../db';
import { sql } from 'kysely';
export const sampleConst = "this is a sample export";

/**
 * customerNameQuery - a query that gets a customer based on their first name.
 * Not terribly useful. But useful enough for a simple demo
 * @param name the customer's name
 * @param limit the limit
 * @isQuery
 * @queryParams ["bob", 44]
 * @returns
 */
export async function customerNameQuery(name: string, limit: number) {
   const res = await db.selectFrom('Customers')
      .select('first_name')
      .where('first_name', '==', name)
      .limit(limit).execute();

   console.log('db status', dbIsOk);
   console.log('res is', res, );

   return res;
}
