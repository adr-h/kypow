import { AllowedLimits, Order } from '@foo/arbitraryTypes';
import { db, dbIsOk } from '@foo/db';
import { sql } from 'kysely';
export const sampleConst = "this is a sample export";


function getDb() {
   return db;
}



type Param = {
   name: string;
   limit: number;
}
/**
 * getCustomerByName - a simple query that gets customers based on their first name.
 * If there are multiple customers, then this query will return
 * all customers that
 * match the given name
 * parameter, up to the provided
 * limit
 *  */
export async function getCustomerByName({ name, limit }: Param) {
   const db = await getDb();
   const res = await db.selectFrom('Customers')
      .select('first_name')
      .select('Customers.password_hash')
      .select('city')
      .where('first_name', '=', name)
      .limit(limit)
      .execute();

   return res;
}

/**
 *You can press [c] to copy the SQL, too:
 *select "first_name" from "Customers" where "first_name" = 'Gordon' limit 2000
 select "first_name" from "Customers" where "first_name" = 'Ramsey' limit 2000
 select "first_name", "Customers"."customer_id" from "Customers" where "first_name" = 'bob' limit 10
 select "first_name", "Customers"."customer_id" from "Customers" where "first_name" = 'michael' limit 2000

 */


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
