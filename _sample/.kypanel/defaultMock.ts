// import { createDummyKysely } from '../../server/services/kysely/dummies/DummyKysely';
import { createDummyKysely } from '../../server/services/kysely/dummies/DummyKysely';

export const db = createDummyKysely({ dialect: 'sqlite' })