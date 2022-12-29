/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { prepareEntityForTemplates, loadRequiredConfigIntoEntity } from '../utils/entity.mjs';
import { formatDateForChangelog } from '../generators/base/utils.mjs';
import BaseGenerator from '../generators/base/index.mjs';
import { prepareFieldForTemplates, getEnumValuesWithCustomValues } from '../utils/field.mjs';
import { getConfigWithDefaults } from '../jdl/jhipster/index.mjs';

const defaultConfig = getConfigWithDefaults();

describe('main utilities', () => {
  const defaultGenerator = { jhipsterConfig: defaultConfig };
  Object.setPrototypeOf(defaultGenerator, BaseGenerator.prototype);

  const defaultEntity = prepareEntityForTemplates(
    loadRequiredConfigIntoEntity({ changelogDate: formatDateForChangelog(new Date()), name: 'Entity' }, defaultConfig),
    defaultGenerator,
    defaultConfig
  );

  describe('prepareFieldForTemplates', () => {
    describe('when called', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let field: any = { fieldName: 'name', fieldType: 'String' };
      beforeEach(() => {
        field = prepareFieldForTemplates(defaultEntity, field, defaultGenerator);
      });
      it('should prepare path and relationshipsPath correctly', () => {
        expect(field.path).to.deep.eq(['name']);
        expect(field.relationshipsPath).to.deep.eq([]);
      });
    });
    describe('with dto != mapstruct and @MapstructExpression', () => {
      const field = { fieldName: 'name', fieldType: 'String', mapstructExpression: 'java()' };
      it('should fail', () => {
        expect(() => prepareFieldForTemplates(defaultEntity, field, defaultGenerator)).to.throw(
          /^@MapstructExpression requires an Entity with mapstruct dto \[Entity.name\].$/
        );
      });
    });
    describe('with dto == mapstruct and @MapstructExpression', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let field: any = { fieldName: 'name', fieldType: 'String', mapstructExpression: 'java()' };
      beforeEach(() => {
        field = prepareFieldForTemplates({ ...defaultEntity, dto: 'mapstruct' }, field, defaultGenerator);
      });
      it('should set field as transient and readonly', () => {
        expect(field.transient).to.be.true;
        expect(field.readonly).to.be.true;
      });
    });
  });

  describe('getEnumValuesWithCustomValues', () => {
    describe('when not passing anything', () => {
      it('should fail', () => {
        expect(() => getEnumValuesWithCustomValues()).to.throw(/^Enumeration values must be passed to get the formatted values\.$/);
      });
    });
    describe('when passing an empty string', () => {
      it('should fail', () => {
        expect(() => getEnumValuesWithCustomValues('')).to.throw(/^Enumeration values must be passed to get the formatted values\.$/);
      });
    });
    describe('when passing a string without custom enum values', () => {
      it('should return a formatted list', () => {
        expect(getEnumValuesWithCustomValues('FRANCE, ENGLAND, ICELAND')).to.deep.equal([
          { name: 'FRANCE', value: 'FRANCE' },
          { name: 'ENGLAND', value: 'ENGLAND' },
          { name: 'ICELAND', value: 'ICELAND' },
        ]);
      });
    });
    describe('when passing a string with some custom enum values', () => {
      it('should return a formatted list', () => {
        expect(getEnumValuesWithCustomValues('FRANCE(france), ENGLAND, ICELAND (viking_country)')).to.deep.equal([
          { name: 'FRANCE', value: 'france' },
          { name: 'ENGLAND', value: 'ENGLAND' },
          { name: 'ICELAND', value: 'viking_country' },
        ]);
      });
    });
    describe('when passing a string custom enum values for each value', () => {
      it('should return a formatted list', () => {
        expect(getEnumValuesWithCustomValues('FRANCE(france), ENGLAND(england), ICELAND (iceland)')).to.deep.equal([
          { name: 'FRANCE', value: 'france' },
          { name: 'ENGLAND', value: 'england' },
          { name: 'ICELAND', value: 'iceland' },
        ]);
      });
    });
  });
});
