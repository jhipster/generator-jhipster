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
        expect(isReserved('ALL', 'COUCHBASE')).to.be.true;
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
