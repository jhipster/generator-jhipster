/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, it } from 'esmocha';
import { expect } from 'chai';
import reservedKeywords from './reserved-keywords.js';

describe('jdl - ReservedKeywords', () => {
  describe('isReserved', () => {
    describe('when passing a nil or empty keyword', () => {
      it('should return false', () => {
        expect(reservedKeywords.isReserved()).to.be.false;
        expect(reservedKeywords.isReserved('', '')).to.be.false;
      });
    });
    describe('when passing a valid keyword', () => {
      it('should return false', () => {
        expect(reservedKeywords.isReserved('ValidKeyword', 'JHIPSTER')).to.be.false;
        expect(reservedKeywords.isReserved('ACCOUNT', 'JAVA')).to.be.false;
      });
    });
    describe('when passing an invalid jhipster keyword, no matter the case', () => {
      it('should return true', () => {
        expect(reservedKeywords.isReserved('Account', 'JHIPSTER')).to.be.true;
        expect(reservedKeywords.isReserved('account', 'jhipster')).to.be.true;
        expect(reservedKeywords.isReserved('ACCOUNT', 'JHIPSTER')).to.be.true;
        expect(reservedKeywords.isReserved('ACCOUNT', 'jhipster')).to.be.true;
      });
    });
    describe('when passing an invalid keyword for different types', () => {
      it('should return true', () => {
        expect(reservedKeywords.isReserved('ACCOUNT', 'jhipster')).to.be.true;
        expect(reservedKeywords.isReserved('SUPER', 'JAVA')).to.be.true;
        expect(reservedKeywords.isReserved('ACCESSIBLE', 'MYSQL')).to.be.true;
        expect(reservedKeywords.isReserved('ANALYSE', 'POSTGRESQL')).to.be.true;
        expect(reservedKeywords.isReserved('ADD', 'CASSANDRA')).to.be.true;
        expect(reservedKeywords.isReserved('ACTIVATE', 'ORACLE')).to.be.true;
        expect(reservedKeywords.isReserved('DOCUMENT', 'MONGODB')).to.be.true;
        expect(reservedKeywords.isReserved('ALL', 'COUCHBASE')).to.be.true;
      });
    });
  });
  describe('isReservedClassName', () => {
    describe('when passing a valid entity name', () => {
      it('should return false', () => {
        expect(reservedKeywords.isReservedClassName('document')).to.be.false;
        expect(reservedKeywords.isReservedClassName('region')).to.be.false;
      });
    });
    describe('when passing an invalid entity name', () => {
      it('should return true', () => {
        expect(reservedKeywords.isReservedClassName('CONTINUE')).to.be.true;
        expect(reservedKeywords.isReservedClassName('ACCOUNT')).to.be.true;
      });
    });
  });
  describe('isReservedFieldName', () => {
    describe('when passing a valid field name', () => {
      it('should return false', () => {
        expect(reservedKeywords.isReservedFieldName('item')).to.be.false;
        expect(reservedKeywords.isReservedFieldName('mySuperField')).to.be.false;
      });
    });
    describe('when passing an invalid Java field name', () => {
      it('should return true', () => {
        expect(reservedKeywords.isReservedFieldName('private')).to.be.true;
        expect(reservedKeywords.isReservedFieldName('class')).to.be.true;
      });
    });
    describe('when passing an invalid Angular field name', () => {
      it('should return true', () => {
        expect(reservedKeywords.isReservedFieldName('injectable')).to.be.true;
        expect(reservedKeywords.isReservedFieldName('injectable', 'angular')).to.be.true;
        expect(reservedKeywords.isReservedFieldName('status', 'angular')).to.be.false;
      });
    });
  });
});
