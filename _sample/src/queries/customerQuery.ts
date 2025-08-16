import { AllowedLimits, Order } from '@foo/arbitraryTypes';
import { db, dbIsOk } from '@foo/db';
import { sql } from 'kysely';
export const sampleConst = "this is a sample export";


type Param = {
   name: string;
   limit: number;
   fromDate: Date;
}

function getDb() {
   return db;
}

/**
 * customerNameQuery - a simple query that gets a customer based on their first name.
 * @isQuery
 *  */
export async function customerNameQuery({ name, limit, date }: Param) {
   const res = await getDb().selectFrom('Customers')
      .select('first_name')
      .select('last_name')
      .where('first_name', '==', name)
      .limit(limit)
      .executeTakeFirstOrThrow();

   console.log('db status', dbIsOk);
   console.log('res is', res, 'a');

   return res;
}

/**
 * Get a customer by the last order they made
 * @param order
 * @returns
 */
export async function getCustomerByLastOrder(order: Order) {
   const res = await getDb().selectFrom('Customers')
      .select('first_name')
      .select('last_name')
      .where('customer_id', '==', order.customerId)
      .limit(AllowedLimits.ONE)
      .executeTakeFirstOrThrow();

   return res;
}