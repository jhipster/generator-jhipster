

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const isReserved = require('../../../../lib/core/jhipster/reserved_keywords').isReserved;
const isReservedClassName = require('../../../../lib/core/jhipster/reserved_keywords').isReservedClassName;
const isReservedFieldName = require('../../../../lib/core/jhipster/reserved_keywords').isReservedFieldName;

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
        expect(isReservedFieldName('item')).to.be.false;
        expect(isReservedFieldName('mySuperField')).to.be.false;
      });
    });
    describe('when passing an invalid field name', () => {
      it('returns true', () => {
        expect(isReservedFieldName('private')).to.be.true;
        expect(isReservedFieldName('class')).to.be.true;
      });
    });
  });
});
