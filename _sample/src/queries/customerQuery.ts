import { db, dbIsOk } from '../db';
import { sql } from 'kysely';
export const sampleConst = "this is a sample export";

type Param2 = {
   isWow: boolean;
}

type Param = {
   name: string;
   limit: number;
   fromDate: Date;
   param2: Param2;
}

/**
 * customerNameQuery - a simple query that gets a customer based on their first name.
 * @isQuery
 * @returns
 */
export async function customerNameQuery({ name, limit, date }: Param) {
   const res = await db.selectFrom('Customers')
      .select('first_name')
      .select('last_name')
      .where('first_name', '==', name)
      .limit(limit)
      .executeTakeFirstOrThrow();

   console.log('db status', dbIsOk);
   console.log('res is', res, 'a');

   return res;
}

// /**
//  * customerNameQuery - a query that gets a customer based on their first name.
//  * Not terribly useful. But useful enough for a simple demo
//  * @param name the customer's name
//  * @param limit the limit
//  * @isQuery
//  * @queryParams ["bob", 44]
//  * @returns
//  */
// export async function customerNameQuery(name: string, limit: number, date: Date) {
//    const res = await db.selectFrom('Customers')
//       .select('first_name')
//       .where('first_name', '==', name)
//       .limit(limit).execute();

//    console.log('db status', dbIsOk);
//    console.log('res is', res, );

//    return res;
// }
