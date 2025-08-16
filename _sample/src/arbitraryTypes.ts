// Completely arbitrary, crappy types to test if the sample param generation works properly

export enum AllowedLimits {
   ONE = 1,
   TWO = 2,
   THREE = 3
}

export interface Order {
   productName: string;
   customerId: number;
   price: Price;
}

type Price = {
   currency: Currency;
   maxAmount: number;
}

enum Currency {
   AUD = 'AUD',
   MYR = 'MYR',
   USD = 'USD',
   IDR = 'IDR',
   INR = 'INR'
}
