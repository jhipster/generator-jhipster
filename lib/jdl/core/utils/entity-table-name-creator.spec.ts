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
import getTableNameFromEntityName, { getTableNameFromEntityNameFallback } from '../utils/entity-table-name-creator.js';

describe('jdl - EntityTableNameCreator', () => {
  describe('getTableNameFromEntityName', () => {
    describe('when not passing an entity name', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => getTableNameFromEntityName(undefined)).to.throw(/^An entity name must be passed to get a table name.$/);
      });
    });
    describe('when passing an entity name', () => {
      describe("like 'Aabcd'", () => {
        it('should just lowercase the first letter', () => {
          expect(getTableNameFromEntityName('Toto')).to.equal('toto');
        });
      });
      describe("like 'AaBbc", () => {
        it('should add underscores before each capitalized letters and lowercase everything', () => {
          expect(getTableNameFromEntityName('TotoTata')).to.equal('toto_tata');
        });
      });
      describe('like ABabc', () => {
        it('should add underscores before each capitalized letters and lowercase everything', () => {
          expect(getTableNameFromEntityName('TTotoTata')).to.equal('t_toto_tata');
        });
      });
      describe('for already converted names', () => {
        it('should keep them the same', () => {
          expect(getTableNameFromEntityName('t_toto_tata')).to.equal('t_toto_tata');
        });
      });
    });
  });
  describe('getTableNameFromEntityNameFallback', () => {
    describe('when not passing an entity name', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => getTableNameFromEntityNameFallback(undefined)).to.throw(/^An entity name must be passed to get a table name.$/);
      });
    });
    describe("like 'AaBbc", () => {
      it('should add return undefined if matches hibernateSnakeCase', () => {
        expect(getTableNameFromEntityNameFallback('TotoTata')).to.equal(undefined);
      });
    });
    describe('like ABabc', () => {
      it('should add return the table name if conflicts with hibernateSnakeCase', () => {
        expect(getTableNameFromEntityNameFallback('TTotoTata')).to.equal('t_toto_tata');
      });
    });
  });
});
