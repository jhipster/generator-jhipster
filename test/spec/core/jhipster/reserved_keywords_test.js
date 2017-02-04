'use strict';

const expect = require('chai').expect,
  isReserved = require('../../../../lib/core/jhipster/reserved_keywords').isReserved,
  isReservedClassName = require('../../../../lib/core/jhipster/reserved_keywords').isReservedClassName,
  isReservedTableName = require('../../../../lib/core/jhipster/reserved_keywords').isReservedTableName,
  isReservedFieldName = require('../../../../lib/core/jhipster/reserved_keywords').isReservedFieldName;

describe('ReservedKeywords', () => {
  describe('::isReserved', () => {
    describe('when passing a nil or empty keyword', () => {
      it('returns false', () => {
        expect(isReserved()).to.be.false;
        expect(isReserved('', '')).to.be.false;
        expect(isReserved('ValidKeyword')).to.be.false;
      });
    });
    describe('when passing a valid keyword', () => {
      it('returns false', () => {
        expect(isReserved('ValidKeyword', 'JHIPSTER')).to.be.false;
        expect(isReserved('ACCOUNT', 'JAVA')).to.be.false;
      });
    });
    describe('when passing an invalid jhipster keyword, no matter the case', () => {
      it('returns true', () => {
        expect(isReserved('Account', 'JHIPSTER')).to.be.true;
        expect(isReserved('account', 'jhipster')).to.be.true;
        expect(isReserved('ACCOUNT', 'JHIPSTER')).to.be.true;
        expect(isReserved('ACCOUNT', 'jhipster')).to.be.true;
      });
    });
    describe('when passing an invalid keyword for different types', () => {
      it('returns true', () => {
        expect(isReserved('ACCOUNT', 'jhipster')).to.be.true;
        expect(isReserved('SUPER', 'JAVA')).to.be.true;
        expect(isReserved('ACCESSIBLE', 'MYSQL')).to.be.true;
        expect(isReserved('ANALYSE', 'POSTGRESQL')).to.be.true;
        expect(isReserved('ADD', 'CASSANDRA')).to.be.true;
        expect(isReserved('ACTIVATE', 'ORACLE')).to.be.true;
        expect(isReserved('DOCUMENT', 'MONGODB')).to.be.true;
      });
    });
  });
  describe('::isReservedClassName', () => {
    describe('when passing a valid entity name', () => {
      it('returns false', () => {
        expect(isReservedClassName('document')).to.be.false;
        expect(isReservedClassName('region')).to.be.false;
      });
    });
    describe('when passing an invalid entity name', () => {
      it('returns true', () => {
        expect(isReservedClassName('CONTINUE')).to.be.true;
        expect(isReservedClassName('ACCOUNT')).to.be.true;
      });
    });
  });
  describe('::isReservedFieldName', () => {
    describe('when passing a valid field name', () => {
      it('returns false', () => {
        expect(isReservedFieldName('item', 'sql')).to.be.false;
        expect(isReservedFieldName('mySuperField', 'cassandra')).to.be.false;
      });
    });
    describe('when passing an invalid field name', () => {
      it('returns true', () => {
        expect(isReservedFieldName('ANALYZE', 'sql')).to.be.true;
        expect(isReservedFieldName('CONTINUE', 'sql')).to.be.true;
      });
    });
  });
  describe('::isReservedTableName', () => {
    describe('when passing a valid table name', () => {
      it('returns false', () => {
        expect(isReservedTableName('job_history', 'sql')).to.be.false;
        expect(isReservedTableName('job', 'mysql')).to.be.false;
        expect(isReservedTableName('document', 'postgresql')).to.be.false;
        expect(isReservedTableName('region', 'oracle')).to.be.false;
        expect(isReservedTableName('item', 'cassandra')).to.be.false;
        expect(isReservedTableName('person', 'mongodb')).to.be.false;
      });
    });
    describe('when passing an invalid table name', () => {
      it('returns true', () => {
        expect(isReservedTableName('ANALYZE', 'sql')).to.be.true;
        expect(isReservedTableName('ANALYZE', 'mysql')).to.be.true;
        expect(isReservedTableName('ANALYZE', 'postgresql')).to.be.true;
        expect(isReservedTableName('ACCESS', 'oracle')).to.be.true;
        expect(isReservedTableName('ADD', 'cassandra')).to.be.true;
        expect(isReservedTableName('DOCUMENT', 'mongodb')).to.be.true;
      });
    });
  });
});
