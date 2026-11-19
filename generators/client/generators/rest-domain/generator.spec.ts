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
      { fieldName: 'code', fieldType: 'String', fieldValidateRules: ['required'], autoGenerate: true },
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
      await helpers
        .runJHipster(generator)
        // The folder of the enumerations is the one of the client framework, which this generator does not compose.
        .withSharedApplication({ webappEnumerationsDir: 'src/main/webapp/app/shared/model/enumerations/' })
        .withJHipsterConfig({ clientFramework: 'react' }, entities);
    });

    it('should write the types of the dates and of each entity', () => {
      expect(Object.keys(result.getSnapshot('**/*.rest.model.ts')).sort()).toEqual([
        'src/main/webapp/app/entities/admin/authority/authority.rest.model.ts',
        'src/main/webapp/app/entities/admin/user-management/user-management.rest.model.ts',
        'src/main/webapp/app/entities/bar/bar.rest.model.ts',
        'src/main/webapp/app/entities/baz/baz.rest.model.ts',
        'src/main/webapp/app/entities/foo/foo.rest.model.ts',
        'src/main/webapp/app/entities/user/user.rest.model.ts',
      ]);
      result.assertFile('src/main/webapp/app/shared/jhipster/rest.model.ts');
    });

    it('should type the fields as their JSON - snapshot', () => {
      expect(result.getSnapshot('**/entities/foo/foo.rest.model.ts')).toMatchSnapshot();
    });

    it('should leave out the types of a read-only entity to send', () => {
      result.assertFileContent('src/main/webapp/app/entities/bar/bar.rest.model.ts', 'export interface RestBar {');
      result.assertNoFileContent('src/main/webapp/app/entities/bar/bar.rest.model.ts', 'NewRestBar');
    });

    it('should send a new entity with a primary key the server does not generate as the entity itself', () => {
      result.assertFileContent(
        'src/main/webapp/app/entities/admin/authority/authority.rest.model.ts',
        'export type NewRestAuthority = RestAuthority;',
      );
    });

    it('should send a new entity with its generated primary key as null and its generated fields as nullable', () => {
      result.assertFileContent(
        'src/main/webapp/app/entities/foo/foo.rest.model.ts',
        "export type NewRestFoo = Omit<RestFoo, 'id' | 'code'> & { id: null; code: string | null };",
      );
    });

    it('should type the built-in user by its id and its login - snapshot', () => {
      expect(result.getSnapshot('**/entities/user/user.rest.model.ts')).toMatchSnapshot();
    });
  });

  describe('with a prefix', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withSharedApplication({ webappEnumerationsDir: 'src/main/webapp/app/shared/model/enumerations/' })
        .withJHipsterConfig({ clientFramework: 'react', restDomainPrefix: 'Api' }, entities);
    });

    it('should name the types of the dates after the prefix', () => {
      result.assertFileContent('src/main/webapp/app/shared/jhipster/rest.model.ts', 'export type ApiLocalDate = string;');
      result.assertNoFileContent('src/main/webapp/app/shared/jhipster/rest.model.ts', 'RestLocalDate');
    });

    it('should name the types of the entities after the prefix', () => {
      const foo = 'src/main/webapp/app/entities/foo/foo.rest.model.ts';
      result.assertFileContent(
        foo,
        "import type { ApiDuration, ApiInstant, ApiLocalDate, ApiLocalTime, ApiZonedDateTime } from '../../shared/jhipster/rest.model';",
      );
      result.assertFileContent(foo, "import type { ApiBar } from '../bar/bar.rest.model';");
      result.assertFileContent(foo, 'export interface ApiFoo {');
      result.assertFileContent(foo, '  day: ApiLocalDate | null;');
      result.assertFileContent(foo, "  bar: Pick<ApiBar, 'id' | 'title'>;");
      result.assertFileContent(foo, 'export type NewApiFoo = ');
      result.assertFileContent(foo, 'export type PartialUpdateApiFoo = ');
      result.assertNoFileContent(foo, 'Rest');
    });
  });
});
