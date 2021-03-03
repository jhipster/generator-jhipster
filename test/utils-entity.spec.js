/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const { expect } = require('chai');
const { prepareEntityForTemplates } = require('../utils/entity');
const { formatDateForChangelog } = require('../utils/liquibase');
const { defaultConfig, entityDefaultConfig } = require('../generators/generator-defaults');
const BaseGenerator = require('../generators/generator-base');

describe('entity utilities', () => {
  const defaultGenerator = { jhipsterConfig: defaultConfig };
  Object.setPrototypeOf(defaultGenerator, BaseGenerator.prototype);

  describe('prepareEntityForTemplates', () => {
    describe('with field with id name', () => {
      describe('without @Id', () => {
        let entity = {
          ...entityDefaultConfig,
          name: 'Entity',
          changelogDate: formatDateForChangelog(new Date()),
          fields: [{ fieldName: 'id', fieldType: 'CustomType' }],
        };
        beforeEach(() => {
          entity = prepareEntityForTemplates(entity, defaultGenerator);
        });
        it('should adopt id field as @Id', () => {
          expect(entity.fields[0]).to.eql({
            dynamic: false,
            fieldName: 'id',
            fieldType: 'CustomType',
            id: true,
          });
        });
      });
      describe('with @Id', () => {
        let entity = {
          ...entityDefaultConfig,
          name: 'Entity',
          changelogDate: formatDateForChangelog(new Date()),
          fields: [
            { fieldName: 'id', fieldType: 'CustomType' },
            { fieldName: 'uuid', fieldType: 'UUID', id: true },
          ],
        };
        beforeEach(() => {
          entity = prepareEntityForTemplates(entity, defaultGenerator);
        });
        it('should not adopt id field as @Id', () => {
          expect(entity.fields[0]).to.eql({
            fieldName: 'id',
            fieldType: 'CustomType',
          });
        });
      });
    });
  });
});
