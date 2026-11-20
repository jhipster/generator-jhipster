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
import { before, describe, expect, it } from 'expect-node';

import type { Entity } from '../../../../lib/jhipster/types/entity.ts';

import Generator from './index.ts';

import { getGeneratorNamespace, shouldSupportFeatures, testBlueprintSupport } from '#test-support';
import { defaultHelpers as helpers, result } from '#testing';

const generator = getGeneratorNamespace(import.meta.dirname);

const entities = [
  {
    name: 'Foo',
    changelogDate: '20200101000100',
    fields: [
      { fieldName: 'name', fieldType: 'String', fieldValidateRules: ['required'] },
      { fieldName: 'note', fieldType: 'String' },
      { fieldName: 'total', fieldType: 'Long', fieldValidateRules: ['required'] },
      { fieldName: 'price', fieldType: 'BigDecimal' },
      { fieldName: 'day', fieldType: 'LocalDate' },
      { fieldName: 'moment', fieldType: 'Instant' },
      { fieldName: 'zoned', fieldType: 'ZonedDateTime' },
      { fieldName: 'span', fieldType: 'Duration' },
      { fieldName: 'time', fieldType: 'LocalTime' },
      { fieldName: 'uid', fieldType: 'UUID' },
      { fieldName: 'active', fieldType: 'Boolean' },
      { fieldName: 'color', fieldType: 'Color', fieldValues: 'RED,GREEN' },
      { fieldName: 'picture', fieldType: 'byte[]', fieldTypeBlobContent: 'image', fieldValidateRules: ['required'] },
      { fieldName: 'text', fieldType: 'byte[]', fieldTypeBlobContent: 'text' },
    ],
    relationships: [
      {
        relationshipName: 'bar',
        otherEntityName: 'Bar',
        relationshipType: 'many-to-one',
        otherEntityField: 'title',
        relationshipValidateRules: 'required',
      },
      { relationshipName: 'owner', otherEntityName: 'Bar', relationshipType: 'many-to-one' },
      { relationshipName: 'user', otherEntityName: 'User', relationshipType: 'many-to-one', otherEntityField: 'login' },
      {
        relationshipName: 'baz',
        otherEntityName: 'Baz',
        relationshipType: 'many-to-many',
        otherEntityField: 'label',
        otherEntityRelationshipName: 'foo',
        relationshipSide: 'left',
      },
    ],
  },
  {
    name: 'Bar',
    changelogDate: '20200101000200',
    readOnly: true,
    fields: [{ fieldName: 'title', fieldType: 'String', fieldValidateRules: ['required'] }],
  },
  {
    name: 'Baz',
    changelogDate: '20200101000300',
    fields: [{ fieldName: 'label', fieldType: 'String' }],
    relationships: [
      {
        relationshipName: 'foo',
        otherEntityName: 'Foo',
        relationshipType: 'many-to-many',
        otherEntityRelationshipName: 'baz',
        relationshipSide: 'right',
      },
    ],
  },
] satisfies Entity[];

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with entities', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({ clientFramework: 'react' }, entities);
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('with a prefix', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({ clientFramework: 'react', restDomainPrefix: 'Api' }, entities);
    });

    // The prefix is a config no sample sets: the generated application cannot tell it from the default one.
    it('should name the types after the prefix', () => {
      result.assertFileContent('src/main/webapp/app/shared/jhipster/rest.model.ts', 'export type ApiLocalDate = string;');
      result.assertFileContent('src/main/webapp/app/entities/foo/foo.rest.model.ts', 'export interface ApiFoo {');
      result.assertFileContent('src/main/webapp/app/entities/foo/foo.rest.model.ts', "bar: Pick<ApiBar, 'id' | 'title'>;");
      result.assertFileContent('src/main/webapp/app/entities/enumerations/color.rest.model.ts', "export type ApiColor = 'RED' | 'GREEN';");
    });
  });
});
