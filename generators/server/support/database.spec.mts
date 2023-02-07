import { jestExpect as expect } from 'mocha-expect-snapshot';

import { databaseTypes } from '../../../jdl/jhipster/index.mjs';
import { getDBTypeFromDBValue } from './database.mjs';

const { CASSANDRA, MONGODB, MYSQL, SQL } = databaseTypes;

describe('generator - base-private', () => {
  describe('getDBTypeFromDBValue', () => {
    describe('when called with sql DB name', () => {
      it('return SQL', () => {
        expect(getDBTypeFromDBValue(MYSQL)).toEqual(SQL);
      });
    });
    describe('when called with mongo DB', () => {
      it('return mongodb', () => {
        expect(getDBTypeFromDBValue(MONGODB)).toEqual(MONGODB);
      });
    });
    describe('when called with cassandra', () => {
      it('return cassandra', () => {
        expect(getDBTypeFromDBValue(CASSANDRA)).toEqual(CASSANDRA);
      });
    });
  });
});
