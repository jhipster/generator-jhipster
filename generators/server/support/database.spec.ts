import { describe, expect, it } from 'esmocha';

import { databaseTypes } from '../../../lib/jhipster/index.ts';

import { getDBTypeFromDBValue, getFKConstraintName, getJoinTableName, getUXConstraintName } from './database.ts';
import { hibernateSnakeCase } from './string.ts';

const { CASSANDRA, MONGODB, MYSQL, SQL, POSTGRESQL } = databaseTypes;

describe('generator - server - support - database', () => {
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

  describe('hibernateSnakeCase', () => {
    describe('when called with a value', () => {
      it('returns a column name', () => {
        expect(hibernateSnakeCase('colName')).toBe('col_name');
        expect(hibernateSnakeCase('colNName')).toBe('colnname');
        expect(hibernateSnakeCase('A')).toBe('a');
        expect(hibernateSnakeCase('EntityA')).toBe('entitya');
      });
    });
  });
  describe('getJoinTableName', () => {
    describe('when called with a value', () => {
      it('returns a join table name', () => {
        expect(getJoinTableName('entityName', 'relationshipName', { prodDatabaseType: POSTGRESQL }).value).toBe(
          'rel_entity_name__relationship_name',
        );
      });
    });
    describe('when called with a long name', () => {
      it('returns a proper join table name', () => {
        expect(
          getJoinTableName('entityNameLongerForPostgresql', 'relationshipNameForPostgresql', { prodDatabaseType: POSTGRESQL }).value,
        ).toBe('rel_entity_name_longer_for_postgr__relationship_name_for_pos_24');
        expect(
          getJoinTableName('entityNameLongerForPostgresql', 'relationshipNameForPostgresql', { prodDatabaseType: POSTGRESQL }).value,
        ).toHaveLength(63);
      });
    });
  });
  describe('getFKConstraintName', () => {
    describe('when called with a value', () => {
      it('returns a constraint name', () => {
        expect(getFKConstraintName('entityName', 'relationshipName', { prodDatabaseType: POSTGRESQL }).value).toBe(
          'fk_entity_name__relationship_name_id',
        );
      });
    });
    describe('when called with a long name and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(
          getFKConstraintName('entityLongerNameWithPaginationAndDTO', 'relationshipLongerNameWithPaginationAndDTO', {
            prodDatabaseType: POSTGRESQL,
          }).value.length,
        ).toBe(63);
        expect(
          getFKConstraintName('entityLongerNameWithPaginationAndDTO', 'relationshipLongerNameWithPaginationAndDTO', {
            prodDatabaseType: POSTGRESQL,
          }).value,
        ).toBe('fk_entity_longer_name_with_pagi__relationship_longer_name_b6_id');
      });
    });
    describe('when called with a long name that is near limit and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(
          getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToMany', { prodDatabaseType: POSTGRESQL }).value.length,
        ).toBeLessThan(64);
        expect(getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToMany', { prodDatabaseType: POSTGRESQL }).value).toBe(
          'fk_test_custom_table_name__user_many_to_many_user_many_to_8c_id',
        );
        expect(
          getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', { prodDatabaseType: POSTGRESQL }).value.length,
        ).toBeLessThan(64);
        expect(getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', { prodDatabaseType: POSTGRESQL }).value).toBe(
          'fk_test_custom_table_name__user_many_to_many_user_many_to_72_id',
        );
      });
    });
    describe('when called with a long name that is equal to limit and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(
          getFKConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', { prodDatabaseType: POSTGRESQL }).value,
        ).toHaveLength(63);
        expect(getFKConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', { prodDatabaseType: POSTGRESQL }).value).toBe(
          'fk_test_custom_table_names__user_many_to_many_user_many_t_50_id',
        );
      });
    });
  });
  describe('getUXConstraintName', () => {
    describe('when called with a value', () => {
      it('returns a constraint name', () => {
        expect(getUXConstraintName('entityName', 'columnName', { prodDatabaseType: POSTGRESQL }).value).toBe('ux_entity_name__column_name');
      });
    });
    describe('when called with a value and no snake case', () => {
      it('returns a constraint name', () => {
        expect(getUXConstraintName('entityName', 'columnName', { prodDatabaseType: POSTGRESQL, noSnakeCase: true }).value).toBe(
          'ux_entityName__columnName',
        );
      });
    });
    describe('when called with a long name and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(
          getUXConstraintName('entityLongerNameWithPaginationAndDTO', 'columnLongerNameWithPaginationAndDTO', {
            prodDatabaseType: POSTGRESQL,
          }).value,
        ).toHaveLength(63);
        expect(
          getUXConstraintName('entityLongerNameWithPaginationAndDTO', 'columnLongerNameWithPaginationAndDTO', {
            prodDatabaseType: POSTGRESQL,
          }).value,
        ).toBe('ux_entity_longer_name_with_pagin__column_longer_name_with_pa_8b');
      });
    });
    describe('when called with a long name that is near limit and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(
          getUXConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', { prodDatabaseType: POSTGRESQL }).value.length,
        ).toBeLessThan(64);
        expect(getUXConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', { prodDatabaseType: POSTGRESQL }).value).toBe(
          'ux_test_custom_table_name__user_many_to_many_user_many_to_ma_72',
        );
      });
    });
    describe('when called with a long name that is equal to limit and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(
          getUXConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', { prodDatabaseType: POSTGRESQL }).value,
        ).toHaveLength(63);
        expect(getUXConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', { prodDatabaseType: POSTGRESQL }).value).toBe(
          'ux_test_custom_table_names__user_many_to_many_user_many_to_m_50',
        );
      });
    });
    describe('when called with a long name and postgresql and no snake case', () => {
      it('returns a proper constraint name', () => {
        expect(
          getUXConstraintName('entityLongerNameWithPaginationAndDTO', 'columnLongerNameWithPaginationAndDTO', {
            prodDatabaseType: POSTGRESQL,
            noSnakeCase: true,
          }).value,
        ).toHaveLength(63);
        expect(
          getUXConstraintName('entityLongerNameWithPaginationAndDTO', 'columnLongerNameWithPaginationAndDTO', {
            prodDatabaseType: POSTGRESQL,
            noSnakeCase: true,
          }).value,
        ).toBe('ux_entityLongerNameWithPaginatio__columnLongerNameWithPagina_8b');
      });
    });
  });
});
