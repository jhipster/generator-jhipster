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
import { before, describe, expect, it } from 'esmocha';
import { basename, resolve } from 'node:path';

import { fieldTypes } from '../../../../lib/jhipster/index.ts';
import { defaultHelpers as helpers, result as runResult } from '../../../../lib/testing/index.ts';
import { shouldSupportFeatures } from '../../../../test/support/tests.ts';

import Generator from './generator.ts';

const {
  CommonDBTypes: { UUID },
} = fieldTypes;

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

const expectedField = () => ({
  generateFakeData: expect.any(Function),

  entity: expect.any(Object),
});

const expectedPrimaryKeyId = () => ({
  field: expect.any(Object),
});

const expectedPrimaryKey = (primaryKey: any) => ({
  ownFields: expect.any(Array),
  fields: expect.any(Array),
  derivedFields: expect.any(Array),
  ids: primaryKey.ids.map(expectedPrimaryKeyId),
});

const expectedEntity = (entity: any) => ({
  faker: expect.any(Object),
  generateFakeData: expect.any(Function),
  resetFakerSeed: expect.any(Function),

  otherEntities: expect.any(Array),
  regularEagerRelations: expect.any(Array),
  reactiveEagerRelations: expect.any(Array),
  reactiveRegularEagerRelations: expect.any(Array),

  restProperties: expect.any(Array),

  fields: entity?.fields?.map(expectedField),
  relationships: expect.any(Array),
  primaryKey: expectedPrimaryKey(entity.primaryKey),
  reactiveOtherEntities: expect.any(Set),
  reactiveUniqueEntityTypes: expect.any(Set),
});

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  // describe('blueprint support', () => testBlueprintSupport(generator, { bootstrapGenerator: true }));

  it('bootstrap migration', async () => {
    await helpers.runJHipster('jhipster:bootstrap-application').prepareEnvironment().withMockedGenerators(['jhipster:app:bootstrap']);
    expect(runResult.getComposedGenerators()).toContain('jhipster:app:bootstrap');
  });

  describe('with', () => {
    describe('default config', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig({}, [
          {
            name: 'EntityA',
            changelogDate: '20220129025419',
            dto: 'mapstruct',
            fields: [
              {
                fieldName: 'id',
                fieldType: UUID,
              },
              {
                fieldName: 'name',
                fieldType: 'String',
              },
              {
                fieldName: 'details',
                fieldType: 'String',
                options: {
                  mapstructExpression: 'java(s.getName())',
                },
              },
            ],
          },
          {
            name: 'User',
            changelogDate: '20220129025420',
            fields: [
              {
                fieldName: 'id',
                fieldType: UUID,
              },
            ],
          },
        ]);
      });

      it('should write files', () => {
        expect(runResult.getSnapshot('**/{.jhipster/**, entities.json}')).toMatchInlineSnapshot(`
{
  ".jhipster/EntityA.json": {
    "contents": "{
  "name": "EntityA",
  "changelogDate": "20220129025419",
  "dto": "mapstruct",
  "fields": [
    {
      "fieldName": "id",
      "fieldType": "UUID"
    },
    {
      "fieldName": "name",
      "fieldType": "String"
    },
    {
      "fieldName": "details",
      "fieldType": "String",
      "options": {
        "mapstructExpression": "java(s.getName())"
      }
    }
  ],
  "relationships": [],
  "annotations": {
    "changelogDate": "20220129025419"
  }
}
",
    "stateCleared": "modified",
  },
  ".jhipster/User.json": {
    "contents": "{
  "name": "User",
  "changelogDate": "20220129025420",
  "fields": [
    {
      "fieldName": "id",
      "fieldType": "UUID"
    }
  ],
  "relationships": [],
  "annotations": {
    "changelogDate": "20220129025420"
  }
}
",
    "stateCleared": "modified",
  },
}
`);
      });
      it('should prepare entities', () => {
        expect(Object.keys(runResult.entities!)).toMatchInlineSnapshot(`
[
  "User",
  "UserManagement",
  "Authority",
  "EntityA",
]
`);
      });
      it('should prepare User', () => {
        const entity = runResult.entities!.User;
        expect(entity).toMatchSnapshot(expectedEntity(entity));
      });
      it('should prepare EntityA', () => {
        const entity = runResult.entities!.EntityA;
        expect(entity).toMatchSnapshot(expectedEntity(entity));
      });
    });

    describe('skipUserManagement', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig(
          {
            skipUserManagement: true,
          },
          [
            {
              name: 'EntityA',
              changelogDate: '20220129025419',
              fields: [
                {
                  fieldName: 'id',
                  fieldType: UUID,
                },
              ],
              annotations: {
                angularJSSuffix: 'js-suffix',
              },
            },
          ],
        );
      });

      it('should write files', () => {
        expect(runResult.getSnapshot('**/{.jhipster/**, entities.json}')).toMatchInlineSnapshot(`
{
  ".jhipster/EntityA.json": {
    "contents": "{
  "name": "EntityA",
  "changelogDate": "20220129025419",
  "fields": [
    {
      "fieldName": "id",
      "fieldType": "UUID"
    }
  ],
  "annotations": {
    "angularJSSuffix": "js-suffix",
    "changelogDate": "20220129025419"
  },
  "relationships": []
}
",
    "stateCleared": "modified",
  },
}
`);
      });
      it('should prepare entities', () => {
        expect(Object.keys(runResult.entities!)).toMatchInlineSnapshot(`
[
  "EntityA",
]
`);
      });
      it('should prepare EntityA', () => {
        const entity = runResult.entities!.EntityA;
        expect(entity).toMatchSnapshot(expectedEntity(entity));
      });
    });
  });
});
