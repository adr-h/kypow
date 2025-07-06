// import { createDummyKysely } from '../../server/services/kysely/dummies/DummyKysely';
import { createDummyKysely } from 'kypanel/server/services/kysely/dummies/DummyKysely';
import { dbIsOk as ok } from '../src/db';

export const db = createDummyKysely({ dialect: 'sqlite' })
export const dbIsOk = `STATUS: ${ok}`;