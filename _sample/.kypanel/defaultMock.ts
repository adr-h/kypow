// import { createDummyKysely } from '../../server/services/kysely/dummies/DummyKysely';
import { createDummyKysely } from 'kypanel/server/services/kysely/dummies/DummyKysely';

export const db = createDummyKysely({ dialect: 'sqlite' })
export { dbIsOk } from '../src/db';
