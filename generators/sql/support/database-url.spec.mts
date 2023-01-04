import { jestExpect as expect } from 'mocha-expect-snapshot';
import { databaseTypes } from '../../../jdl/jhipster/index.mjs';
import { getJdbcUrl, getR2dbcUrl } from './database-url.mjs';

const { H2_MEMORY, H2_DISK, MARIADB, MSSQL, MYSQL, ORACLE, POSTGRESQL } = databaseTypes;

describe('generators - sql - database-url', () => {
  describe('getJdbcUrl', () => {
    describe('when called for mysql', () => {
      it('return jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true', () => {
        expect(getJdbcUrl(MYSQL, { databaseName: 'test', hostname: 'localhost' })).toEqual(
          'jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true'
        );
      });
    });
    describe('when called for mysql with skipExtraOptions enabled', () => {
      it('return jdbc:mysql://localhost:3306/test', () => {
        expect(getJdbcUrl(MYSQL, { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })).toEqual(
          'jdbc:mysql://localhost:3306/test'
        );
      });
    });
    describe('when called for mariadb', () => {
      it('return jdbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC', () => {
        expect(getJdbcUrl(MARIADB, { databaseName: 'test', hostname: 'localhost' })).toEqual(
          'jdbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC'
        );
      });
    });
    describe('when called for mariadb with skipExtraOptions enabled', () => {
      it('return jdbc:mariadb://localhost:3306/test', () => {
        expect(getJdbcUrl(MARIADB, { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })).toEqual(
          'jdbc:mariadb://localhost:3306/test'
        );
      });
    });
    describe('when called for postgresql', () => {
      it('return jdbc:postgresql://localhost:5432/test', () => {
        expect(getJdbcUrl(POSTGRESQL, { databaseName: 'test', hostname: 'localhost' })).toEqual('jdbc:postgresql://localhost:5432/test');
      });
    });
    describe('when called for oracle', () => {
      it('return jdbc:oracle:thin:@localhost:1521:test', () => {
        expect(getJdbcUrl(ORACLE, { databaseName: 'test', hostname: 'localhost' })).toEqual('jdbc:oracle:thin:@localhost:1521:test');
      });
    });
    describe('when called for mssql', () => {
      it('return jdbc:sqlserver://localhost:1433;database=test;encrypt=false', () => {
        expect(getJdbcUrl(MSSQL, { databaseName: 'test', hostname: 'localhost' })).toEqual(
          'jdbc:sqlserver://localhost:1433;database=test;encrypt=false'
        );
      });
    });
    describe('when called for h2Disk', () => {
      it('return jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1', () => {
        expect(getJdbcUrl(H2_DISK, { databaseName: 'test', localDirectory: './build/h2db/db' })).toEqual(
          'jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1'
        );
      });
    });
    describe('when called for h2Disk and mysql as prod', () => {
      it('return jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1', () => {
        expect(getJdbcUrl(H2_DISK, { prodDatabaseType: 'mysql', databaseName: 'test', localDirectory: './build/h2db/db' })).toEqual(
          'jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1;MODE=MYSQL'
        );
      });
    });
    describe('when called for h2Disk and mariadb as prod', () => {
      it('return jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1', () => {
        expect(getJdbcUrl(H2_DISK, { prodDatabaseType: 'mariadb', databaseName: 'test', localDirectory: './build/h2db/db' })).toEqual(
          'jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1;MODE=LEGACY'
        );
      });
    });
    describe('when called for h2Disk with skipExtraOptions enabled', () => {
      it('return jdbc:h2:file:./build/h2db/db/test', () => {
        expect(getJdbcUrl(H2_DISK, { databaseName: 'test', localDirectory: './build/h2db/db', skipExtraOptions: true })).toEqual(
          'jdbc:h2:file:./build/h2db/db/test'
        );
      });
    });
    describe('when called for h2Disk with missing `localDirectory` option', () => {
      it('throw an error', () => {
        expect(() => getJdbcUrl(H2_DISK, { databaseName: 'test' })).toThrow(
          "'localDirectory' option should be provided for h2Disk databaseType"
        );
      });
    });
    describe('when called for h2Memory', () => {
      it('return jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE', () => {
        expect(getJdbcUrl(H2_MEMORY, { databaseName: 'test' })).toEqual('jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE');
      });
    });
    describe('when called for h2Memory with custom protocolSuffix', () => {
      it('return jdbc:h2:tcp:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE', () => {
        expect(getJdbcUrl(H2_MEMORY, { databaseName: 'test', protocolSuffix: 'h2:tcp:' })).toEqual(
          'jdbc:h2:tcp:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE'
        );
      });
    });
    describe('when called for h2Memory and mysql as prod', () => {
      it('return jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE', () => {
        expect(getJdbcUrl(H2_MEMORY, { prodDatabaseType: 'mysql', databaseName: 'test' })).toEqual(
          'jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MYSQL'
        );
      });
    });
    describe('when called for h2Memory and mariadb as prod', () => {
      it('return jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE', () => {
        expect(getJdbcUrl(H2_MEMORY, { prodDatabaseType: 'mariadb', databaseName: 'test' })).toEqual(
          'jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=LEGACY'
        );
      });
    });
    describe('when called for h2Memory with skipExtraOptions enabled', () => {
      it('return jdbc:h2:mem:test', () => {
        expect(getJdbcUrl(H2_MEMORY, { databaseName: 'test', skipExtraOptions: true })).toEqual('jdbc:h2:mem:test');
      });
    });
    describe('when called with missing `databaseName` option', () => {
      it('throw an error', () => {
        expect(() => getJdbcUrl(MYSQL)).toThrow("option 'databaseName' is required");
      });
    });
    describe('when called for an unknown databaseType', () => {
      it('throw an error', () => {
        expect(() => getJdbcUrl('foodb', { databaseName: 'test' })).toThrow('foodb databaseType is not supported');
      });
    });
  });

  describe('getR2dbcUrl', () => {
    describe('when called for mysql', () => {
      it('return r2dbc:mariadb://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true', () => {
        expect(getR2dbcUrl(MYSQL, { databaseName: 'test', hostname: 'localhost' })).toEqual(
          'r2dbc:mariadb://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true'
        );
      });
    });
    describe('when called for mysql with skipExtraOptions enabled', () => {
      it('return r2dbc:mariadb://localhost:3306/test', () => {
        expect(getR2dbcUrl(MYSQL, { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })).toEqual(
          'r2dbc:mariadb://localhost:3306/test'
        );
      });
    });
    describe('when called for mariadb', () => {
      it('return r2dbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC', () => {
        expect(getR2dbcUrl(MARIADB, { databaseName: 'test', hostname: 'localhost' })).toEqual(
          'r2dbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC'
        );
      });
    });
    describe('when called for mariadb with skipExtraOptions enabled', () => {
      it('return r2dbc:mariadb://localhost:3306/test', () => {
        expect(getR2dbcUrl(MARIADB, { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })).toEqual(
          'r2dbc:mariadb://localhost:3306/test'
        );
      });
    });
    describe('when called for postgresql', () => {
      it('return r2dbc:postgresql://localhost:5432/test', () => {
        expect(getR2dbcUrl(POSTGRESQL, { databaseName: 'test', hostname: 'localhost' })).toEqual('r2dbc:postgresql://localhost:5432/test');
      });
    });
    describe('when called for oracle', () => {
      it('return r2dbc:oracle:thin:@localhost:1521:test', () => {
        expect(getR2dbcUrl(ORACLE, { databaseName: 'test', hostname: 'localhost' })).toEqual('r2dbc:oracle:thin:@localhost:1521:test');
      });
    });
    describe('when called for mssql', () => {
      it('return r2dbc:mssql://localhost:1433/test', () => {
        expect(getR2dbcUrl(MSSQL, { databaseName: 'test', hostname: 'localhost' })).toEqual('r2dbc:mssql://localhost:1433/test');
      });
    });
    describe('when called for h2Disk', () => {
      it('return r2dbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1', () => {
        expect(getR2dbcUrl(H2_DISK, { databaseName: 'test', localDirectory: './build/h2db/db' })).toEqual(
          'r2dbc:h2:file:///./build/h2db/db/test;DB_CLOSE_DELAY=-1'
        );
      });
    });
    describe('when called for h2Disk with skipExtraOptions enabled', () => {
      it('return r2dbc:h2:file:://./build/h2db/db/test', () => {
        expect(getR2dbcUrl(H2_DISK, { databaseName: 'test', localDirectory: './build/h2db/db', skipExtraOptions: true })).toEqual(
          'r2dbc:h2:file:///./build/h2db/db/test'
        );
      });
    });
    describe('when called for h2Disk with missing `localDirectory` option', () => {
      it('throw an error', () => {
        expect(() => getR2dbcUrl(H2_DISK, { databaseName: 'test' })).toThrow(
          "'localDirectory' option should be provided for h2Disk databaseType"
        );
      });
    });
    describe('when called for h2Memory', () => {
      it('return r2dbc:h2:mem:///test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE', () => {
        expect(getR2dbcUrl(H2_MEMORY, { databaseName: 'test' })).toEqual('r2dbc:h2:mem:///test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE');
      });
    });
    describe('when called for h2Memory with skipExtraOptions enabled', () => {
      it('return r2dbc:h2:mem:///test', () => {
        expect(getR2dbcUrl(H2_MEMORY, { databaseName: 'test', skipExtraOptions: true })).toEqual('r2dbc:h2:mem:///test');
      });
    });
    describe('when called with missing `databaseName` option', () => {
      it('throw an error', () => {
        expect(() => getR2dbcUrl(MYSQL)).toThrow("option 'databaseName' is required");
      });
    });
    describe('when called for an unknown databaseType', () => {
      it('throw an error', () => {
        expect(() => getR2dbcUrl('foodb', { databaseName: 'test' })).toThrow('foodb databaseType is not supported');
      });
    });
  });
});
