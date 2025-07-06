export * from 'kysely';
import { Kysely as ActualKysely, type TableExpressionOrList } from 'kysely';
import { DummyConnection } from '../dummies/DummyConnection';

type ConstructorArgs<T> = ConstructorParameters<typeof ActualKysely<T>>;

function proxify<T extends object>(selector: T) {
   const res = new Proxy(selector, {
      get(target, prop, receiver) {
         if (prop === 'acquireConnection') {
            return () => Promise.resolve(new DummyConnection());
         }

         const value = Reflect.get(target, prop, receiver);
         if (typeof value === 'function') {
            return function (...args: any[]) {
               const result = value.apply(target, args);

               // If the result looks like another builder, re-wrap it
               if (result && typeof result === 'object') {
                  return proxify(result);
               }
               return result;
            };
         }

         return value;
      },
   })

   return res;
}

class KyselyCompileImposter<T> extends ActualKysely<T> {
   constructor(...args: ConstructorArgs<T>) {
      console.log("Kysely instance created with args:", args);
      super(...args);
   }

   // @ts-expect-error: will unfungle the parameter types later
   selectFrom(...args: Parameters<ActualKysely<T>['selectFrom']>) {
      const selector = super.selectFrom(...args);

      return proxify(selector);
   }

   // @ts-expect-error: will unfungle the parameter types later
   selectNoFrom(...args: Parameters<ActualKysely<T>['selectNoFrom']>) {
      const selector = super.selectNoFrom(...args);

      return proxify(selector);
   }
}


export { KyselyCompileImposter as Kysely }

