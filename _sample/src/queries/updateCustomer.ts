import { db, dbIsOk } from '../db';
// vjlskdfjglksdfg

type CustomerDetails = {
   address: string;
   city: string;
   country: string;
   email: string;
   first_name: string;
   last_name: string;
   password_hash: string;
   postal_code: string;
}

/**
 * Insert a customer into the DB
 * @param customerDetails
 *
 * @returns
 */
export async function updateCustomerQuery(id: string, customerDetails: CustomerDetails) {
   console.info('params passed:', id, customerDetails);

   const res = await db.insertInto('Customers')
      .values(customerDetails)
      .executeTakeFirst()

   return res;
}
