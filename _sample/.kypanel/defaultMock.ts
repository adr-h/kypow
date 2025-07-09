// import { createDummyKysely } from '../../server/services/kysely/dummies/DummyKysely';
import { createDummyKysely } from 'kypanel/server/kysely';
import { dbIsOk as ok } from '../src/db';

export const db = createDummyKysely({ dialect: 'sqlite' })
export const dbIsOk = `DB STATUS: NOT ${ok}`;