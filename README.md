# Kypow

https://github.com/user-attachments/assets/1a5111cb-481f-4ffc-92dc-8d858e748009


A Storybook-like tool for Kysely-powered apps.

## Basic usage

1. Run `npx github:adr-h/kypow --dialect postgres --moduleType esm`
2. If the Kysely instance your app uses is exported by another package (e.g: "@zurg/db-service"), you will need to pass an additional "--externalPackage" flag for that package: `npx github:adr-h/kypow --dialect postgres --moduleType esm --externalPackage "@zurg/db-service"`

If you have any "Queries" in your project, they should then be picked up and listed. See [Queries](#queries) for details.

## Queries
A valid "Query" as defined by this tool, is any function in a module that:
   - is exported
   - has a "@isQuery" JSDoc tag
   - runs a Kysely instance's execute() function

A simple, valid query function might look like this:
```typescript
import { db } from 'somewhere';

/**
 * customerQuery - a very, very simple query that gets a customer based on their ID.
 * @isQuery
 * @returns
 */
export async function customerQuery({ id, limit }: { id: string; limit: number}) {
   const res = await db.selectFrom('Customers')
      .select('first_name')
      .where('id', '==', id)
      .limit(limit)
      .execute();

   return res;
}
```

