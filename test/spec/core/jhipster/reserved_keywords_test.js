'use strict';

const expect = require('chai').expect,
    isReserved = require('../../../../lib/core/jhipster/reserved_keywords').isReserved,
    isReservedClassName = require('../../../../lib/core/jhipster/reserved_keywords').isReservedClassName,
    isReservedTableName = require('../../../../lib/core/jhipster/reserved_keywords').isReservedTableName,
    isReservedFieldName = require('../../../../lib/core/jhipster/reserved_keywords').isReservedFieldName;

describe('ReservedKeywords', function () {
  describe('::isReserved', function () {
    describe('when passing a nil or empty keyword', function () {
      it('returns false', function () {
        expect(isReserved()).to.be.false;
        expect(isReserved('','')).to.be.false;
        expect(isReserved('ValidKeyword')).to.be.false;
      });
    });
    describe('when passing a valid keyword', function() {
      it('returns false', function() {
        expect(isReserved('ValidKeyword', 'JHIPSTER')).to.be.false;
        expect(isReserved('ACCOUNT', 'JAVA')).to.be.false;
      });
    });
    describe('when passing an invalid jhipster keyword, no matter the case', function() {
      it('returns true', function() {
        expect(isReserved('Account', 'JHIPSTER')).to.be.true;
        expect(isReserved('account', 'jhipster')).to.be.true;
        expect(isReserved('ACCOUNT', 'JHIPSTER')).to.be.true;
        expect(isReserved('ACCOUNT', 'jhipster')).to.be.true;
      });
    });
    describe('when passing an invalid keyword for diffrent types', function() {
      it('returns true', function() {
        expect(isReserved('ACCOUNT', 'jhipster')).to.be.true;
        expect(isReserved('SUPER', 'JAVA')).to.be.true;
        expect(isReserved('ACCESSIBLE', 'MYSQL')).to.be.true;
        expect(isReserved('ANALYSE', 'POSTGRESQL')).to.be.true;
        expect(isReserved('ADD', 'CASSANDRA')).to.be.true;
        expect(isReserved('ACTIVATE', 'ORACLE')).to.be.true;
        expect(isReserved('DOCUMENT', 'MONGODB')).to.be.true;
      });
    });
    describe('when passing an invalid entity name', function() {
      it('returns true', function() {
        expect(isReservedClassName('Account')).to.be.true;
        expect(isReservedClassName('ACCOUNT')).to.be.true;
      });
    });
    describe('when passing an invalid table name', function() {
      it('returns true', function() {
        expect(isReservedTableName('ANALYZE', 'mysql')).to.be.true;
        expect(isReservedTableName('Analyze', 'MYSQL')).to.be.true;
      });
    });
    describe('when passing an invalid entity name', function() {
      it('returns true', function() {
        expect(isReservedFieldName('ANALYZE', 'mysql')).to.be.true;
        expect(isReservedFieldName('Analyze', 'MYSQL')).to.be.true;
      });
    });
  });
});
