/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import sinon from 'sinon';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import Environment from 'yeoman-environment';

import Base from '../generators/base/index.mjs';
import { testInTempDir, revertTempDir } from './utils/utils.mjs';
import { parseChangelog } from '../generators/base/utils.mjs';
import { databaseTypes } from '../jdl/jhipster/index.mjs';

const { H2_MEMORY, H2_DISK, MARIADB, MSSQL, MYSQL, ORACLE, POSTGRESQL } = databaseTypes;

const BaseGenerator: any = Base.prototype;

BaseGenerator.log = msg => {
  // eslint-disable-next-line no-console
  console.log(msg);
};

describe('Generator Base', () => {
  describe('getAllSupportedLanguages', () => {
    describe('when called', () => {
      it('returns an array', () => {
        expect(BaseGenerator.getAllSupportedLanguages()).to.not.have.length(0);
      });
    });
  });
  describe('isSupportedLanguage', () => {
    describe('when called with valid language', () => {
      it('returns true', () => {
        expect(BaseGenerator.isSupportedLanguage('en')).to.be.true;
      });
    });
    describe('when called with invalid language', () => {
      it('returns false', () => {
        expect(BaseGenerator.isSupportedLanguage('ab')).to.equal(false);
      });
    });
  });
  describe('getAllSupportedLanguageOptions', () => {
    describe('when called', () => {
      it('returns an array', () => {
        expect(BaseGenerator.getAllSupportedLanguages()).to.not.have.length(0);
      });
    });
  });
  describe('getTableName', () => {
    describe('when called with a value', () => {
      it('returns a table name', () => {
        expect(BaseGenerator.getTableName('tableName')).to.equal('table_name');
      });
    });
  });
  describe('getColumnName', () => {
    describe('when called with a value', () => {
      it('returns a column name', () => {
        expect(BaseGenerator.getColumnName('colName')).to.equal('col_name');
        expect(BaseGenerator.getColumnName('colNName')).to.equal('colnname');
      });
    });
  });
  describe('getJoinTableName', () => {
    describe('when called with a value', () => {
      it('returns a join table name', () => {
        expect(BaseGenerator.getJoinTableName('entityName', 'relationshipName', POSTGRESQL)).to.equal('rel_entity_name__relationship_name');
      });
    });
    describe('when called with a long name', () => {
      it('returns a proper join table name', () => {
        expect(BaseGenerator.getJoinTableName('entityNameLongerForPostgresql', 'relationshipNameForPostgresql', POSTGRESQL)).to.equal(
          'rel_entity_name_longer_for_postgr__relationship_name_for_pos_24'
        );
        expect(BaseGenerator.getJoinTableName('entityNameLongerForPostgresql', 'relationshipNameForPostgresql', POSTGRESQL)).to.have.length(
          63
        );
      });
    });
    describe('when legacyRelationshipTableName is set', () => {
      it('returns a proper join table name', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        function TestClass() {}
        TestClass.prototype = Object.create(Base.prototype);
        TestClass.prototype.jhipsterConfig = { legacyRelationshipTableName: true };
        expect(TestClass.prototype.getJoinTableName('entityNameLongerForPostgresql', 'relationshipNameForPostgresql', POSTGRESQL)).to.equal(
          'rel_entity_name_longer_for_postgr__relationship_name_for_pos_24'
        );
        expect(
          TestClass.prototype.getJoinTableName('entityNameLongerForPostgresql', 'relationshipNameForPostgresql', POSTGRESQL)
        ).to.have.length(63);
      });
    });
  });
  describe('getFKConstraintName', () => {
    describe('when called with a value', () => {
      it('returns a constraint name', () => {
        expect(BaseGenerator.getFKConstraintName('entityName', 'relationshipName', POSTGRESQL)).to.equal(
          'fk_entity_name__relationship_name_id'
        );
      });
    });
    describe('when called with a long name and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(
          BaseGenerator.getFKConstraintName(
            'entityLongerNameWithPaginationAndDTO',
            'relationshipLongerNameWithPaginationAndDTO',
            POSTGRESQL
          )
        ).to.have.length(63);
        expect(
          BaseGenerator.getFKConstraintName(
            'entityLongerNameWithPaginationAndDTO',
            'relationshipLongerNameWithPaginationAndDTO',
            POSTGRESQL
          )
        ).to.equal('fk_entity_longer_name_with_pagi__relationship_longer_name_b6_id');
      });
    });
    describe('when called with a long name that is near limit and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToMany', POSTGRESQL).length).to.be.lessThan(
          64
        );
        expect(BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToMany', POSTGRESQL)).to.equal(
          'fk_test_custom_table_name__user_many_to_many_user_many_to_8c_id'
        );
        expect(
          BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', POSTGRESQL).length
        ).to.be.lessThan(64);
        expect(BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', POSTGRESQL)).to.equal(
          'fk_test_custom_table_name__user_many_to_many_user_many_to_72_id'
        );
      });
    });
    describe('when called with a long name that is equal to limit and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(BaseGenerator.getFKConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', POSTGRESQL)).to.have.length(63);
        expect(BaseGenerator.getFKConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', POSTGRESQL)).to.equal(
          'fk_test_custom_table_names__user_many_to_many_user_many_t_50_id'
        );
      });
    });
  });
  describe('getUXConstraintName', () => {
    describe('when called with a value', () => {
      it('returns a constraint name', () => {
        expect(BaseGenerator.getUXConstraintName('entityName', 'columnName', POSTGRESQL)).to.equal('ux_entity_name__column_name');
      });
    });
    describe('when called with a value and no snake case', () => {
      it('returns a constraint name', () => {
        expect(BaseGenerator.getUXConstraintName('entityName', 'columnName', POSTGRESQL, true)).to.equal('ux_entityName__columnName');
      });
    });
    describe('when called with a long name and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(
          BaseGenerator.getUXConstraintName('entityLongerNameWithPaginationAndDTO', 'columnLongerNameWithPaginationAndDTO', POSTGRESQL)
        ).to.have.length(63);
        expect(
          BaseGenerator.getUXConstraintName('entityLongerNameWithPaginationAndDTO', 'columnLongerNameWithPaginationAndDTO', POSTGRESQL)
        ).to.equal('ux_entity_longer_name_with_pagi__column_longer_name_with_pag_8b');
      });
    });
    describe('when called with a long name that is near limit and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(
          BaseGenerator.getUXConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', POSTGRESQL).length
        ).to.be.lessThan(64);
        expect(BaseGenerator.getUXConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', POSTGRESQL)).to.equal(
          'ux_test_custom_table_name__user_many_to_many_user_many_to_ma_72'
        );
      });
    });
    describe('when called with a long name that is equal to limit and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(BaseGenerator.getUXConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', POSTGRESQL)).to.have.length(63);
        expect(BaseGenerator.getUXConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', POSTGRESQL)).to.equal(
          'ux_test_custom_table_names__user_many_to_many_user_many_to_m_50'
        );
      });
    });
    describe('when called with a long name and postgresql and no snake case', () => {
      it('returns a proper constraint name', () => {
        expect(
          BaseGenerator.getUXConstraintName(
            'entityLongerNameWithPaginationAndDTO',
            'columnLongerNameWithPaginationAndDTO',
            POSTGRESQL,
            true
          )
        ).to.have.length(63);
        expect(
          BaseGenerator.getUXConstraintName(
            'entityLongerNameWithPaginationAndDTO',
            'columnLongerNameWithPaginationAndDTO',
            POSTGRESQL,
            true
          )
        ).to.equal('ux_entityLongerNameWithPaginati__columnLongerNameWithPaginat_8b');
      });
    });
  });
  describe('printJHipsterLogo', () => {
    describe('when called', () => {
      it('prints the logo', () => {
        expect(BaseGenerator.printJHipsterLogo()).to.equal(undefined);
      });
    });
  });
  describe('checkForNewVersion', () => {
    describe('when called', () => {
      it('prints the new version info', () => {
        expect(BaseGenerator.checkForNewVersion()).to.equal(undefined);
      });
    });
  });
  describe('getFrontendAppName', () => {
    describe('when called with name having App', () => {
      it('returns the frontend app name', () => {
        BaseGenerator.jhipsterConfig = { baseName: 'myAmazingApp' };
        expect(BaseGenerator.getFrontendAppName()).to.equal('myAmazingApp');
      });
    });
    describe('when called with name', () => {
      it('returns the frontend app name with the App suffix added', () => {
        BaseGenerator.jhipsterConfig = { baseName: 'myAwesomeProject' };
        expect(BaseGenerator.getFrontendAppName()).to.equal('myAwesomeProjectApp');
      });
    });
    describe('when called with name starting with a digit', () => {
      it('returns the default frontend app name - App', () => {
        BaseGenerator.jhipsterConfig = { baseName: '1derful' };
        expect(BaseGenerator.getFrontendAppName()).to.equal('App');
      });
    });
  });
  describe('getMainClassName', () => {
    describe('when called with name', () => {
      it('return the app name', () => {
        BaseGenerator.baseName = 'myTest';
        expect(BaseGenerator.getMainClassName()).to.equal('MyTestApp');
      });
    });
    describe('when called with name having App', () => {
      it('return the app name', () => {
        BaseGenerator.baseName = 'myApp';
        expect(BaseGenerator.getMainClassName()).to.equal('MyApp');
      });
    });
    describe('when called with name having invalid java chars', () => {
      it('return the default app name', () => {
        BaseGenerator.baseName = '9myApp';
        expect(BaseGenerator.getMainClassName()).to.equal('Application');
      });
    });
  });
  describe('dateFormatForLiquibase', () => {
    let base;
    let oldCwd;
    let options;
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      oldCwd = testInTempDir(() => {});
      base = new Base({ ...options, env: Environment.createEnv() });
    });
    afterEach(() => {
      revertTempDir(oldCwd);
    });
    describe('when there is no configured lastLiquibaseTimestamp', () => {
      let firstChangelogDate;
      beforeEach(() => {
        assert.noFile('.yo-rc.json');
        firstChangelogDate = base.dateFormatForLiquibase();
      });
      it('should return a valid changelog date', () => {
        expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
      });
      it('should save lastLiquibaseTimestamp', () => {
        expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseChangelog(firstChangelogDate).getTime());
      });
    });
    describe('when a past lastLiquibaseTimestamp is configured', () => {
      let firstChangelogDate;
      beforeEach(() => {
        const lastLiquibaseTimestamp = new Date(2000, 1, 1);
        base.config.set('lastLiquibaseTimestamp', lastLiquibaseTimestamp.getTime());
        expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(lastLiquibaseTimestamp.getTime());
        firstChangelogDate = base.dateFormatForLiquibase();
      });
      it('should return a valid changelog date', () => {
        expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
      });
      it('should not return a past changelog date', () => {
        expect(firstChangelogDate.startsWith('2000')).to.be.false;
      });
      it('should save lastLiquibaseTimestamp', () => {
        expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseChangelog(firstChangelogDate).getTime());
      });
    });
    describe('when a future lastLiquibaseTimestamp is configured', () => {
      let firstChangelogDate;
      let secondChangelogDate;
      beforeEach(() => {
        const lastLiquibaseTimestamp = new Date(Date.parse('2030-01-01'));
        base.config.set('lastLiquibaseTimestamp', lastLiquibaseTimestamp.getTime());
        expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(lastLiquibaseTimestamp.getTime());
        firstChangelogDate = base.dateFormatForLiquibase();
        secondChangelogDate = base.dateFormatForLiquibase();
      });
      it('should return a valid changelog date', () => {
        expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
      });
      it('should return a future changelog date', () => {
        expect(firstChangelogDate.startsWith('2030')).to.be.true;
      });
      it('should return a reproducible changelog date', () => {
        expect(firstChangelogDate).to.be.equal('20300101000001');
        expect(secondChangelogDate).to.be.equal('20300101000002');
      });
      it('should save lastLiquibaseTimestamp', () => {
        expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseChangelog('20300101000002').getTime());
      });
    });
    describe('with withEntities option', () => {
      before(() => {
        options = { withEntities: true };
      });
      after(() => {
        options = undefined;
      });
      describe('with reproducible=false argument', () => {
        let firstChangelogDate;
        let secondChangelogDate;
        beforeEach(() => {
          firstChangelogDate = base.dateFormatForLiquibase(false);
          secondChangelogDate = base.dateFormatForLiquibase(false);
        });
        it('should return a valid changelog date', () => {
          expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
          expect(/^\d{14}$/.test(secondChangelogDate)).to.be.true;
        });
        it('should return a reproducible changelog date incremental to lastLiquibaseTimestamp', () => {
          expect(firstChangelogDate).to.not.be.equal(secondChangelogDate);
        });
        it('should save lastLiquibaseTimestamp', () => {
          expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseChangelog(secondChangelogDate).getTime());
        });
      });
      describe('with a past creationTimestamp option', () => {
        let firstChangelogDate;
        let secondChangelogDate;
        before(() => {
          options.creationTimestamp = '2000-01-01';
        });
        beforeEach(() => {
          firstChangelogDate = base.dateFormatForLiquibase();
          secondChangelogDate = base.dateFormatForLiquibase();
        });
        it('should return a valid changelog date', () => {
          expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
        });
        it('should return a past changelog date', () => {
          expect(firstChangelogDate.startsWith('2000')).to.be.true;
        });
        it('should return a reproducible changelog date', () => {
          expect(firstChangelogDate).to.be.equal('20000101000100');
          expect(secondChangelogDate).to.be.equal('20000101000200');
        });
        it('should save lastLiquibaseTimestamp', () => {
          expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseChangelog('20000101000200').getTime());
        });
      });
      describe('with a future creationTimestamp option', () => {
        it('should throw', () => {
          options.creationTimestamp = '2030-01-01';
          expect(() => new Base({ ...options, env: Environment.createEnv() })).to.throw(
            /^Creation timestamp should not be in the future: 2030-01-01\.$/
          );
        });
      });
    });
  });
  describe('getJDBCUrl', () => {
    describe('when called for mysql', () => {
      it('return jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true', () => {
        expect(BaseGenerator.getJDBCUrl(MYSQL, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true'
        );
      });
    });
    describe('when called for mysql with skipExtraOptions enabled', () => {
      it('return jdbc:mysql://localhost:3306/test', () => {
        expect(BaseGenerator.getJDBCUrl(MYSQL, { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })).to.equal(
          'jdbc:mysql://localhost:3306/test'
        );
      });
    });
    describe('when called for mariadb', () => {
      it('return jdbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC', () => {
        expect(BaseGenerator.getJDBCUrl(MARIADB, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'jdbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC'
        );
      });
    });
    describe('when called for mariadb with skipExtraOptions enabled', () => {
      it('return jdbc:mariadb://localhost:3306/test', () => {
        expect(BaseGenerator.getJDBCUrl(MARIADB, { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })).to.equal(
          'jdbc:mariadb://localhost:3306/test'
        );
      });
    });
    describe('when called for postgresql', () => {
      it('return jdbc:postgresql://localhost:5432/test', () => {
        expect(BaseGenerator.getJDBCUrl(POSTGRESQL, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'jdbc:postgresql://localhost:5432/test'
        );
      });
    });
    describe('when called for oracle', () => {
      it('return jdbc:oracle:thin:@localhost:1521:test', () => {
        expect(BaseGenerator.getJDBCUrl(ORACLE, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'jdbc:oracle:thin:@localhost:1521:test'
        );
      });
    });
    describe('when called for mssql', () => {
      it('return jdbc:sqlserver://localhost:1433;database=test;encrypt=false', () => {
        expect(BaseGenerator.getJDBCUrl(MSSQL, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'jdbc:sqlserver://localhost:1433;database=test;encrypt=false'
        );
      });
    });
    describe('when called for h2Disk', () => {
      it('return jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1', () => {
        expect(BaseGenerator.getJDBCUrl(H2_DISK, { databaseName: 'test', localDirectory: './build/h2db/db' })).to.equal(
          'jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1'
        );
      });
    });
    describe('when called for h2Disk and mysql as prod', () => {
      it('return jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1', () => {
        expect(
          BaseGenerator.getJDBCUrl(H2_DISK, { prodDatabaseType: 'mysql', databaseName: 'test', localDirectory: './build/h2db/db' })
        ).to.equal('jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1;MODE=MYSQL');
      });
    });
    describe('when called for h2Disk and mariadb as prod', () => {
      it('return jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1', () => {
        expect(
          BaseGenerator.getJDBCUrl(H2_DISK, { prodDatabaseType: 'mariadb', databaseName: 'test', localDirectory: './build/h2db/db' })
        ).to.equal('jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1;MODE=LEGACY');
      });
    });
    describe('when called for h2Disk with skipExtraOptions enabled', () => {
      it('return jdbc:h2:file:./build/h2db/db/test', () => {
        expect(
          BaseGenerator.getJDBCUrl(H2_DISK, { databaseName: 'test', localDirectory: './build/h2db/db', skipExtraOptions: true })
        ).to.equal('jdbc:h2:file:./build/h2db/db/test');
      });
    });
    describe('when called for h2Disk with missing `localDirectory` option', () => {
      it('throw an error', () => {
        expect(() => BaseGenerator.getJDBCUrl(H2_DISK, { databaseName: 'test' })).to.throw(
          "'localDirectory' option should be provided for h2Disk databaseType"
        );
      });
    });
    describe('when called for h2Memory', () => {
      it('return jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE', () => {
        expect(BaseGenerator.getJDBCUrl(H2_MEMORY, { databaseName: 'test' })).to.equal(
          'jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE'
        );
      });
    });
    describe('when called for h2Memory and mysql as prod', () => {
      it('return jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE', () => {
        expect(BaseGenerator.getJDBCUrl(H2_MEMORY, { prodDatabaseType: 'mysql', databaseName: 'test' })).to.equal(
          'jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MYSQL'
        );
      });
    });
    describe('when called for h2Memory and mariadb as prod', () => {
      it('return jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE', () => {
        expect(BaseGenerator.getJDBCUrl(H2_MEMORY, { prodDatabaseType: 'mariadb', databaseName: 'test' })).to.equal(
          'jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=LEGACY'
        );
      });
    });
    describe('when called for h2Memory with skipExtraOptions enabled', () => {
      it('return jdbc:h2:mem:test', () => {
        expect(BaseGenerator.getJDBCUrl(H2_MEMORY, { databaseName: 'test', skipExtraOptions: true })).to.equal('jdbc:h2:mem:test');
      });
    });
    describe('when called with missing `databaseName` option', () => {
      it('throw an error', () => {
        expect(() => BaseGenerator.getJDBCUrl(MYSQL)).to.throw("option 'databaseName' is required");
      });
    });
    describe('when called for an unknown databaseType', () => {
      it('throw an error', () => {
        expect(() => BaseGenerator.getJDBCUrl('foodb', { databaseName: 'test' })).to.throw('foodb databaseType is not supported');
      });
    });
  });

  describe('getR2DBCUrl', () => {
    describe('when called for mysql', () => {
      it('return r2dbc:mariadb://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true', () => {
        expect(BaseGenerator.getR2DBCUrl(MYSQL, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'r2dbc:mariadb://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true'
        );
      });
    });
    describe('when called for mysql with skipExtraOptions enabled', () => {
      it('return r2dbc:mariadb://localhost:3306/test', () => {
        expect(BaseGenerator.getR2DBCUrl(MYSQL, { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })).to.equal(
          'r2dbc:mariadb://localhost:3306/test'
        );
      });
    });
    describe('when called for mariadb', () => {
      it('return r2dbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC', () => {
        expect(BaseGenerator.getR2DBCUrl(MARIADB, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'r2dbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC'
        );
      });
    });
    describe('when called for mariadb with skipExtraOptions enabled', () => {
      it('return r2dbc:mariadb://localhost:3306/test', () => {
        expect(BaseGenerator.getR2DBCUrl(MARIADB, { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })).to.equal(
          'r2dbc:mariadb://localhost:3306/test'
        );
      });
    });
    describe('when called for postgresql', () => {
      it('return r2dbc:postgresql://localhost:5432/test', () => {
        expect(BaseGenerator.getR2DBCUrl(POSTGRESQL, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'r2dbc:postgresql://localhost:5432/test'
        );
      });
    });
    describe('when called for oracle', () => {
      it('return r2dbc:oracle:thin:@localhost:1521:test', () => {
        expect(BaseGenerator.getR2DBCUrl(ORACLE, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'r2dbc:oracle:thin:@localhost:1521:test'
        );
      });
    });
    describe('when called for mssql', () => {
      it('return r2dbc:mssql://localhost:1433/test', () => {
        expect(BaseGenerator.getR2DBCUrl(MSSQL, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'r2dbc:mssql://localhost:1433/test'
        );
      });
    });
    describe('when called for h2Disk', () => {
      it('return r2dbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1', () => {
        expect(BaseGenerator.getR2DBCUrl(H2_DISK, { databaseName: 'test', localDirectory: './build/h2db/db' })).to.equal(
          'r2dbc:h2:file:///./build/h2db/db/test;DB_CLOSE_DELAY=-1'
        );
      });
    });
    describe('when called for h2Disk with skipExtraOptions enabled', () => {
      it('return r2dbc:h2:file:://./build/h2db/db/test', () => {
        expect(
          BaseGenerator.getR2DBCUrl(H2_DISK, { databaseName: 'test', localDirectory: './build/h2db/db', skipExtraOptions: true })
        ).to.equal('r2dbc:h2:file:///./build/h2db/db/test');
      });
    });
    describe('when called for h2Disk with missing `localDirectory` option', () => {
      it('throw an error', () => {
        expect(() => BaseGenerator.getR2DBCUrl(H2_DISK, { databaseName: 'test' })).to.throw(
          "'localDirectory' option should be provided for h2Disk databaseType"
        );
      });
    });
    describe('when called for h2Memory', () => {
      it('return r2dbc:h2:mem:///test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE', () => {
        expect(BaseGenerator.getR2DBCUrl(H2_MEMORY, { databaseName: 'test' })).to.equal(
          'r2dbc:h2:mem:///test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE'
        );
      });
    });
    describe('when called for h2Memory with skipExtraOptions enabled', () => {
      it('return r2dbc:h2:mem:///test', () => {
        expect(BaseGenerator.getR2DBCUrl(H2_MEMORY, { databaseName: 'test', skipExtraOptions: true })).to.equal('r2dbc:h2:mem:///test');
      });
    });
    describe('when called with missing `databaseName` option', () => {
      it('throw an error', () => {
        expect(() => BaseGenerator.getR2DBCUrl(MYSQL)).to.throw("option 'databaseName' is required");
      });
    });
    describe('when called for an unknown databaseType', () => {
      it('throw an error', () => {
        expect(() => BaseGenerator.getR2DBCUrl('foodb', { databaseName: 'test' })).to.throw('foodb databaseType is not supported');
      });
    });
  });

  describe('priorities', () => {
    let mockedPriorities;
    const priorities = [
      'initializing',
      'prompting',
      'configuring',
      'composing',
      'loading',
      'preparing',
      'default',
      'writing',
      'postWriting',
      'install',
      'end',
    ];
    before(() => {
      mockedPriorities = {};
      priorities.forEach(priority => {
        mockedPriorities[priority] = sinon.fake();
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockBlueprintSubGen: any = class extends Base {
        get [Base.INITIALIZING]() {
          return {
            mocked() {
              mockedPriorities.initializing();
            },
          };
        }

        get [Base.PROMPTING]() {
          return {
            mocked() {
              mockedPriorities.prompting();
            },
          };
        }

        get [Base.CONFIGURING]() {
          return {
            mocked() {
              mockedPriorities.configuring();
            },
          };
        }

        get [Base.COMPOSING]() {
          return {
            mocked() {
              mockedPriorities.composing();
            },
          };
        }

        get [Base.LOADING]() {
          return {
            mocked() {
              mockedPriorities.loading();
            },
          };
        }

        get [Base.PREPARING]() {
          return {
            mocked() {
              mockedPriorities.preparing();
            },
          };
        }

        get [Base.DEFAULT]() {
          return {
            mocked() {
              mockedPriorities.default();
            },
          };
        }

        get [Base.WRITING]() {
          return {
            mocked() {
              mockedPriorities.writing();
            },
          };
        }

        get [Base.POST_WRITING]() {
          return {
            mocked() {
              mockedPriorities.postWriting();
            },
          };
        }

        get [Base.INSTALL]() {
          return {
            mocked() {
              mockedPriorities.install();
            },
          };
        }

        get [Base.END]() {
          return {
            mocked() {
              mockedPriorities.end();
            },
          };
        }
      };
      return helpers.create(mockBlueprintSubGen).run();
    });

    priorities.forEach((priority, idx) => {
      it(`should execute ${priority}`, () => {
        assert(mockedPriorities[priority].calledOnce);
      });
      if (idx > 0) {
        const lastPriority = priorities[idx - 1];
        it(`should execute ${priority} after ${lastPriority} `, () => {
          assert(mockedPriorities[priority].calledAfter(mockedPriorities[lastPriority]));
        });
      }
    });
  });
});
