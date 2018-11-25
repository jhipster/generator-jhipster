/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new, no-unused-expressions */
const { expect } = require('chai');
const ReservedKeywords = require('../../../../lib/core/jhipster/reserved_keywords');

describe('ReservedKeywords', () => {
  describe('::isReserved', () => {
    context('when passing a nil or empty keyword', () => {
      it('returns false', () => {
        expect(ReservedKeywords.isReserved()).to.be.false;
        expect(ReservedKeywords.isReserved('', '')).to.be.false;
      });
    });
    context('when passing a valid keyword', () => {
      it('returns false', () => {
        expect(ReservedKeywords.isReserved('ValidKeyword', 'JHIPSTER')).to.be.false;
        expect(ReservedKeywords.isReserved('ACCOUNT', 'JAVA')).to.be.false;
      });
    });
    context('when passing an invalid jhipster keyword, no matter the case', () => {
      it('returns true', () => {
        expect(ReservedKeywords.isReserved('Account', 'JHIPSTER')).to.be.true;
        expect(ReservedKeywords.isReserved('account', 'jhipster')).to.be.true;
        expect(ReservedKeywords.isReserved('ACCOUNT', 'JHIPSTER')).to.be.true;
        expect(ReservedKeywords.isReserved('ACCOUNT', 'jhipster')).to.be.true;
      });
    });
    context('when passing an invalid keyword for different types', () => {
      it('returns true', () => {
        expect(ReservedKeywords.isReserved('ACCOUNT', 'jhipster')).to.be.true;
        expect(ReservedKeywords.isReserved('SUPER', 'JAVA')).to.be.true;
        expect(ReservedKeywords.isReserved('ACCESSIBLE', 'MYSQL')).to.be.true;
        expect(ReservedKeywords.isReserved('ANALYSE', 'POSTGRESQL')).to.be.true;
        expect(ReservedKeywords.isReserved('ADD', 'CASSANDRA')).to.be.true;
        expect(ReservedKeywords.isReserved('ACTIVATE', 'ORACLE')).to.be.true;
        expect(ReservedKeywords.isReserved('DOCUMENT', 'MONGODB')).to.be.true;
        expect(ReservedKeywords.isReserved('ALL', 'COUCHBASE')).to.be.true;
      });
    });
  });
  describe('::isReservedClassName', () => {
    context('when passing a valid entity name', () => {
      it('returns false', () => {
        expect(ReservedKeywords.isReservedClassName('document')).to.be.false;
        expect(ReservedKeywords.isReservedClassName('region')).to.be.false;
      });
    });
    context('when passing an invalid entity name', () => {
      it('returns true', () => {
        expect(ReservedKeywords.isReservedClassName('CONTINUE')).to.be.true;
        expect(ReservedKeywords.isReservedClassName('ACCOUNT')).to.be.true;
      });
    });
  });
  describe('::isReservedFieldName', () => {
    context('when passing a valid field name', () => {
      it('returns false', () => {
        expect(ReservedKeywords.isReservedFieldName('item')).to.be.false;
        expect(ReservedKeywords.isReservedFieldName('mySuperField')).to.be.false;
      });
    });
    context('when passing an invalid Java field name', () => {
      it('returns true', () => {
        expect(ReservedKeywords.isReservedFieldName('private')).to.be.true;
        expect(ReservedKeywords.isReservedFieldName('class')).to.be.true;
      });
    });
    context('when passing an invalid Angular field name', () => {
      it('returns true', () => {
        expect(ReservedKeywords.isReservedFieldName('injectable')).to.be.true;
        expect(ReservedKeywords.isReservedFieldName('injectable', 'angularX')).to.be.true;
        expect(ReservedKeywords.isReservedFieldName('status', 'angularX')).to.be.false;
      });
    });
  });
});
