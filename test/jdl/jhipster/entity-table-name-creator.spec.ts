/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import { expect } from 'chai';
import { entityTableNameCreator } from '../../../jdl/jhipster/index.mjs';

const getTableNameFromEntityName = entityTableNameCreator;

describe('EntityTableNameCreator', () => {
  describe('getTableNameFromEntityName', () => {
    context('when not passing an entity name', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => getTableNameFromEntityName(undefined)).to.throw(/^An entity name must be passed to get a table name.$/);
      });
    });
    context('when passing an entity name', () => {
      context("like 'Aabcd'", () => {
        it('should just lowercase the first letter', () => {
          expect(getTableNameFromEntityName('Toto')).to.equal('toto');
        });
      });
      context("like 'AaBbc", () => {
        it('should add underscores before each capitalized letters and lowercase everything', () => {
          expect(getTableNameFromEntityName('TotoTata')).to.equal('toto_tata');
        });
      });
      context('like ABabc', () => {
        it('should add underscores before each capitalized letters and lowercase everything', () => {
          expect(getTableNameFromEntityName('TTotoTata')).to.equal('t_toto_tata');
        });
      });
      context('for already converted names', () => {
        it('should keep them the same', () => {
          expect(getTableNameFromEntityName('t_toto_tata')).to.equal('t_toto_tata');
        });
      });
    });
  });
});
