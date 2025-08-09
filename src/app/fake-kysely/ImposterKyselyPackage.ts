export * from 'kysely';
import { Kysely as ActualKysely } from 'kysely';
import { DummyDriver } from './DummyDriver';
import { fileURLToPath } from 'node:url'

type ConstructorArgs<T> = ConstructorParameters<typeof ActualKysely<T>>;

class KyselyImposter<T> extends ActualKysely<T> {
   constructor(arg: ConstructorArgs<T>[0]) {
      const dialectWithDummyDriver = cloneWithOverride(arg.dialect, 'createDriver', () => new DummyDriver())
      super(cloneWithOverride(arg, 'dialect', dialectWithDummyDriver))
   }
}

function getOwnPath() {
  // TODO: support CJS
  return fileURLToPath(import.meta.url);
}
const path = getOwnPath();

export {
  KyselyImposter as Kysely,
  path as __KyselyImposterPath__
}

// clones and overrides an object, even if the properties in that object are non-enumerable (e.g: class instance methods)
function cloneWithOverride<T, P extends keyof T>(original: T, property: P, propertyOverride: T[P]) {
  const clone = Object.create(Object.getPrototypeOf(original));

  Object.defineProperties(
    clone,
    Object.getOwnPropertyDescriptors(original)
  );

  clone[property] = propertyOverride;

  return clone;
}