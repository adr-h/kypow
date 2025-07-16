type Address = {
   street: string;
   state: string;
   country: string;
}

type Foo = {
   name: string;
   age: number;
   // address: Address;
}

export function paramlessFunction(): string {
   return 'bah';
}


/**
 * sampleFunction
 * @param f - the name
 * @param limit - the limit
 * @isQuery
 * @queryParams [{ "name": "Bah", "age": 44 }, 44]
 * @returns
 */
export function sampleFunction(f: Foo, limit: number): string {
   return `${f.name}: ${limit}`;
}