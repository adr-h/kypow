type Address = {
   street: string;
   state: string;
   country: string;
}

export type Foo = {
   name: string;
   age: number;
   // address: Address;
}

export function paramlessFunction(): string {
   return 'bah';
}


/**
 * sampleFunction to get a jonied formatted string
 * it may have several things in it
 * @param z - the name
 * @param limit - the limit
 * @isQuery
 * @returns
 */
export function sampleFunction(z: Foo, limit: number): string {
   return `${z.name}: ${limit}`;
}