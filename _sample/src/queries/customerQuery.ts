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
 *
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
 * Nonsense function that get a customer by the last order they made (or the second last order, because why not)
 * @param lastOrder
 * @returns
 */
export async function getCustomerByLastOrder(lastOrder: Order, secondLastOrder: Order) {
   const res = await getDb().selectFrom('Customers')
      .select('first_name')
      .select('last_name')
      .where(eb => eb.or([
         eb('customer_id', '==', lastOrder.customerId),
         eb('customer_id', '==', secondLastOrder.customerId)
      ]))
      .limit(AllowedLimits.ONE)
      .executeTakeFirstOrThrow();

   return res;
}

/**
 * Nonsense arrow function, exported as a const
 * @returns
 */
export const getBestCustomer = async (metric: number) => {
   const res = await getDb().selectFrom('Customers')
      .select('first_name')
      .select('last_name')
      .where(eb => eb.or([
         eb('customer_id', '==', 101),
      ]))
      .executeTakeFirstOrThrow();

   return res;
}
