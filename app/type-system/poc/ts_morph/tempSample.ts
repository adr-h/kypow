type Address = {
   street: string;
   state: string;
   country: string;
}

type Foo = {
   name: string;
   age: number;
   address: Address;
}

interface Bar {
   
}

export function sampleFunction(f: Foo, limit: number): string {
   return `${f.name}: ${limit}`;
}