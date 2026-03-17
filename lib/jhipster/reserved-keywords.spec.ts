/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { describe, expect, it } from 'esmocha';

import reservedKeywords from './reserved-keywords.ts';

describe('jdl - ReservedKeywords', () => {
  describe('isReserved', () => {
    describe('when passing a nil or empty keyword', () => {
      it('should return false', () => {
        expect(reservedKeywords.isReserved()).toBe(false);
        expect(reservedKeywords.isReserved('', '')).toBe(false);
      });
    });
    describe('when passing a valid keyword', () => {
      it('should return false', () => {
        expect(reservedKeywords.isReserved('ValidKeyword', 'JHIPSTER')).toBe(false);
        expect(reservedKeywords.isReserved('ACCOUNT', 'JAVA')).toBe(false);
      });
    });
    describe('when passing an invalid jhipster keyword, no matter the case', () => {
      it('should return true', () => {
        expect(reservedKeywords.isReserved('Account', 'JHIPSTER')).toBe(true);
        expect(reservedKeywords.isReserved('account', 'jhipster')).toBe(true);
        expect(reservedKeywords.isReserved('ACCOUNT', 'JHIPSTER')).toBe(true);
        expect(reservedKeywords.isReserved('ACCOUNT', 'jhipster')).toBe(true);
      });
    });
    describe('when passing an invalid keyword for different types', () => {
      it('should return true', () => {
        expect(reservedKeywords.isReserved('ACCOUNT', 'jhipster')).toBe(true);
        expect(reservedKeywords.isReserved('SUPER', 'JAVA')).toBe(true);
        expect(reservedKeywords.isReserved('ACCESSIBLE', 'MYSQL')).toBe(true);
        expect(reservedKeywords.isReserved('ANALYSE', 'POSTGRESQL')).toBe(true);
        expect(reservedKeywords.isReserved('ADD', 'CASSANDRA')).toBe(true);
        expect(reservedKeywords.isReserved('ACTIVATE', 'ORACLE')).toBe(true);
        expect(reservedKeywords.isReserved('DOCUMENT', 'MONGODB')).toBe(true);
        expect(reservedKeywords.isReserved('ALL', 'COUCHBASE')).toBe(true);
      });
    });
  });
  describe('isReservedClassName', () => {
    describe('when passing a valid entity name', () => {
      it('should return false', () => {
        expect(reservedKeywords.isReservedClassName('document')).toBe(false);
        expect(reservedKeywords.isReservedClassName('region')).toBe(false);
      });
    });
    describe('when passing an invalid entity name', () => {
      it('should return true', () => {
        expect(reservedKeywords.isReservedClassName('CONTINUE')).toBe(true);
        expect(reservedKeywords.isReservedClassName('ACCOUNT')).toBe(true);
      });
    });
  });
  describe('isReservedFieldName', () => {
    describe('when passing a valid field name', () => {
      it('should return false', () => {
        expect(reservedKeywords.isReservedFieldName('item')).toBe(false);
        expect(reservedKeywords.isReservedFieldName('mySuperField')).toBe(false);
      });
    });
    describe('when passing an invalid Java field name', () => {
      it('should return true', () => {
        expect(reservedKeywords.isReservedFieldName('private')).toBe(true);
        expect(reservedKeywords.isReservedFieldName('class')).toBe(true);
      });
    });
    describe('when passing an invalid Angular field name', () => {
      it('should return true', () => {
        expect(reservedKeywords.isReservedFieldName('injectable')).toBe(true);
        expect(reservedKeywords.isReservedFieldName('injectable', 'angular')).toBe(true);
        expect(reservedKeywords.isReservedFieldName('status', 'angular')).toBe(false);
      });
    });
  });
});
