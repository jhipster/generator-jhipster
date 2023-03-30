import { jestExpect as expect } from 'mocha-expect-snapshot';
import { hibernateSnakeCase } from './string.mjs';

describe('generator - server - support - string', () => {
  describe('hibernateSnakeCase', () => {
    describe('when called with a value', () => {
      it('returns a table name', () => {
        expect(hibernateSnakeCase('tableName')).toEqual('table_name');
      });
    });
  });
});
