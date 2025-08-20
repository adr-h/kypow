# Kypow
A Storybook-like tool for Kysely-powered apps.

## Disclaimer
Warning: I built this for my own personal usage; therefore, it may not be entirely ready for general prime time use yet. Current identified issues include:
- all code is currently being run through `tsx` instead of being compiled
- and probably other issues

## Basic usage

1. Run `npx github:adr-h/kypow --dialect postgres --moduleType esm`
2. If the Kysely instance your app uses is exported by another package (e.g: `import {db} from "@zurg/db-service"`), you will need to pass an additional "--externalPackage" flag for that package: `npx github:adr-h/kypow --dialect postgres --moduleType esm --externalPackage "@zurg/db-service"`

If you have any "Queries" in your project, they should then be picked up and listed. See [Queries](#queries) for details.

## Queries
A valid "Query" as defined by this tool, is any function in a module that:
   - is exported
   - calls Kysely's execute() | executeTakeFirst() | executeTakeFirstOrThrow()
   - has simple parameters.
     - I.e, supported types for parameters include:
       - non-symbol primitives (boolean, int, string, bigint)
         - literals of above primitives
       - Date, Map or Set instances
       - arrays of any supported type
       - tuples of any supported type
       - objects (interfaces/object-like type aliases) with properties that match any supported type
         - basic intersections of object-like types
       - basic unions where all members match any supported type
     - Ideally, your function's parameters would all be JSON serializible; but common use cases like Date / bigint/ etc are supported.

Note that if your function includes multiple query calls, only information for the first encountered query will be displayed.

A simple, valid query function might look like this:
```typescript
import { db } from 'somewhere';

/**
 * customerQuery - a very, very simple query that gets a customer based on their ID.
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

