/** Copyright 2013-2019 the original author or authors from the JHipster project.
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

const { expect } = require('chai');
const { createFromEntityName } = require('../../../../lib/core/jhipster/entity_table_name_creator');

describe('EntityTableNameCreator', () => {
  describe('createFromEntityName', () => {
    context('when not passing an entity name', () => {
      it('should fail', () => {
        expect(() => createFromEntityName(undefined)).to.throw(/^An entity name must be passed to get a table name.$/);
      });
    });
    context('when passing an entity name', () => {
      context("like 'Aabcd'", () => {
        it('should just lowercase the first letter', () => {
          expect(createFromEntityName('Toto')).to.equal('toto');
        });
      });
      context("like 'AaBbc", () => {
        it('should add underscores before each capitalized letters and lowercase everything', () => {
          expect(createFromEntityName('TotoTata')).to.equal('toto_tata');
        });
      });
      context('like ABabc', () => {
        it('should add underscores before each capitalized letters and lowercase everything', () => {
          expect(createFromEntityName('TTotoTata')).to.equal('t_toto_tata');
        });
      });
      context('for already converted names', () => {
        it('should keep them the same', () => {
          expect(createFromEntityName('t_toto_tata')).to.equal('t_toto_tata');
        });
      });
    });
  });
});
