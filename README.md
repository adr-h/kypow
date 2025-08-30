# Kypow

https://github.com/user-attachments/assets/c5aaa752-c2ba-4497-ae70-1d9018134e50



A Storybook-like tool for Kysely-powered apps.

## Basic usage

1. Run `npx github:adr-h/kypow --dialect postgres --moduleType esm`
2. If the Kysely instance your app uses is exported by another package (e.g: `import {db} from "@zurg/db-service"`), you will need to pass an additional "--externalPackage" flag for that package: `npx github:adr-h/kypow --dialect postgres --moduleType esm --externalPackage "@zurg/db-service"`
3. Search for modules in your project, select them, and if they have any exported "Queries", Kypow will handle the rest. See [Queries](#queries) for details.

## Features
- zero project-footprint; you do not need to install `kypow` to your project, or create any special files (e.g: like Storybook's `.stories`)
- allows you to safely view the SQL your query functions would generate without actually executing them
- allows you to easily copy the generated SQL
- allows you to simulate passing parameters to your query functions, and have the generated SQL update accordingly
  - supports basic JSON serializable values for parameters, as well as Date/Map/Set/bigint via [telejson](https://www.npmjs.com/package/telejson)
- automatically updates as you save your project files, via chokidar.

## Queries
A valid "Query" as defined by this tool, is any **function** that:
   - is exported
   - calls Kysely's execute() | executeTakeFirst() | executeTakeFirstOrThrow()
   - ideally only has a single responsibility
     - (i.e: your function only executes a Kysely query, and does not perform file writing, sending HTTP requests, etc)
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
     - Ideally, your function's parameters would all be JSON serializible; but common use cases like Date/bigint/Map/Set etc are supported, and you can input parameters for them via [telejson](https://www.npmjs.com/package/telejson)'s format.

Note: 
- if your function includes multiple .execute() calls, only information about the first encountered .execute() will be displayed.

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


## Known Issues / TO-DO:
- [ ] actually build the project, so we can remove reliance on `tsx`

