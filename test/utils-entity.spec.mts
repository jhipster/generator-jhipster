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
import { prepareEntityPrimaryKeyForTemplates } from '../utils/entity.mjs';
import { formatDateForChangelog } from '../generators/base/utils.mjs';
import generatorDefaults from '../generators/generator-defaults.mjs';
import BaseGenerator from '../generators/base/index.mjs';

const { defaultConfig, entityDefaultConfig } = generatorDefaults;

describe('entity utilities', () => {
  const defaultGenerator = { jhipsterConfig: defaultConfig };
  Object.setPrototypeOf(defaultGenerator, BaseGenerator.prototype);

  describe('prepareEntityPrimaryKeyForTemplates', () => {
    describe('with field with id name', () => {
      describe('without @Id', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let entity: any = {
          ...entityDefaultConfig,
          name: 'Entity',
          changelogDate: formatDateForChangelog(new Date()),
          fields: [{ fieldName: 'id', fieldType: 'CustomType', path: ['id'], relationshipsPath: [] }],
        };
        beforeEach(() => {
          entity = prepareEntityPrimaryKeyForTemplates(entity, defaultGenerator);
        });
        it('should adopt id field as @Id', () => {
          expect(entity.fields[0]).to.eql({
            dynamic: false,
            fieldName: 'id',
            fieldType: 'CustomType',
            id: true,
            path: ['id'],
            relationshipsPath: [],
          });
        });

        it('should contains correct structure', () => {
          expect(entity.primaryKey).to.deep.include({
            name: 'id',
            nameCapitalized: 'Id',
            type: 'CustomType',
            derived: false,
            composite: false,
          });
          expect(entity.primaryKey.fields[0]).to.equal(entity.fields[0]);
        });
      });

      describe('with @Id', () => {
        let entity = {
          ...entityDefaultConfig,
          name: 'Entity',
          changelogDate: formatDateForChangelog(new Date()),
          fields: [
            { fieldName: 'id', fieldType: 'CustomType', path: ['id'], relationshipsPath: [] },
            { fieldName: 'uuid', fieldType: 'UUID', id: true, path: ['uuid'], relationshipsPath: [] },
          ],
        };
        beforeEach(() => {
          entity = prepareEntityPrimaryKeyForTemplates(entity, defaultGenerator);
        });
        it('should not adopt id field as @Id', () => {
          expect(entity.fields[0]).to.eql({
            fieldName: 'id',
            fieldType: 'CustomType',
            path: ['id'],
            relationshipsPath: [],
          });
        });
      });

      describe('with multiple @Id relationships and field', () => {
        let entity1;
        let entity2;
        let entity3;
        let entity4;

        beforeEach(() => {
          entity1 = {
            ...entityDefaultConfig,
            name: 'Entity1',
            entityClass: 'Entity1',
            entityInstance: 'entity1',
            fields: [
              {
                fieldName: 'id',
                fieldNameCapitalized: 'Id',
                columnName: 'id',
                fieldType: 'String',
                id: true,
                path: ['id'],
                relationshipsPath: [],
              },
            ],
          };
          entity2 = {
            ...entityDefaultConfig,
            name: 'Entity2',
            entityClass: 'Entity2',
            entityInstance: 'entity2',
            fields: [
              {
                fieldName: 'uuid',
                fieldNameCapitalized: 'Uuid',
                columnName: 'uuid',
                fieldType: 'UUID',
                id: true,
                autoGenerate: true,
                path: ['uuid'],
                relationshipsPath: [],
              },
            ],
          };
          entity3 = {
            ...entityDefaultConfig,
            name: 'Entity3',
            entityClass: 'Entity3',
            entityInstance: 'entity3',
            relationships: [
              {
                relationshipName: 'entity2',
                relationshipNameCapitalized: 'Entity2',
                relationshipType: 'one-to-one',
                id: true,
                otherEntity: entity2,
              },
            ],
          };
          entity4 = {
            ...entityDefaultConfig,
            name: 'Entity4',
            entityClass: 'Entity4',
            entityInstance: 'entity4',
            fields: [
              {
                fieldName: 'uuid',
                fieldType: 'UUID',
                columnName: 'uuid',
                id: true,
                autoGenerate: false,
                path: ['uuid'],
                relationshipsPath: [],
              },
            ],
            relationships: [
              {
                relationshipName: 'otherEntity1',
                relationshipNameCapitalized: 'OtherEntity1',
                id: true,
                otherEntity: entity1,
                relationshipType: 'many-to-one',
              },
              {
                relationshipName: 'otherEntity3',
                relationshipNameCapitalized: 'OtherEntity3',
                id: true,
                otherEntity: entity3,
                relationshipType: 'many-to-one',
              },
            ],
          };

          entity1 = prepareEntityPrimaryKeyForTemplates(entity1, defaultGenerator, true);
          entity2 = prepareEntityPrimaryKeyForTemplates(entity2, defaultGenerator, true);
          entity3 = prepareEntityPrimaryKeyForTemplates(entity3, defaultGenerator, true);
          entity4 = prepareEntityPrimaryKeyForTemplates(entity4, defaultGenerator, true);
        });

        it('should prepare correct primaryKey for entity1', () => {
          expect(entity1.primaryKey.fields).to.have.lengthOf(1);
          expect(entity1.primaryKey).to.deep.include({
            name: 'id',
            nameCapitalized: 'Id',
            type: 'String',
            tsType: 'string',
            derived: false,
            composite: false,
          });
          expect(entity1.primaryKey.fields[0]).to.equal(entity1.fields[0]);
        });

        it('should prepare correct primaryKey for entity2', () => {
          expect(entity2.primaryKey.fields).to.have.lengthOf(1);
          expect(entity2.primaryKey).to.deep.include({
            name: 'uuid',
            nameCapitalized: 'Uuid',
            type: 'UUID',
            tsType: 'string',
            derived: false,
            composite: false,
          });
          expect(entity2.primaryKey.fields[0]).to.equal(entity2.fields[0]);
        });

        it('should prepare correct primaryKey for one-to-one relationship id', () => {
          expect(entity3.primaryKey.fields).to.have.lengthOf(1);
          expect(entity3.primaryKey).to.deep.include({
            name: 'uuid',
            nameCapitalized: 'Uuid',
            type: 'UUID',
            derived: true,
            composite: false,
          });
          expect(entity3.primaryKey.fields[0]).to.deep.include({
            fieldName: 'uuid',
            autoGenerate: true,
          });
        });

        it('should prepare correct primaryKey for entity4', () => {
          expect(entity4.primaryKey.fields).to.have.lengthOf(3);
          expect(entity4.primaryKey).to.deep.include({
            name: 'id',
            nameCapitalized: 'Id',
            type: 'Entity4Id',
            composite: true,
            autoGenerate: false,
          });
        });

        it('should prepare correct own id', () => {
          expect(entity4.primaryKey.fields[0]).to.deep.include({
            fieldName: 'uuid',
          });
        });

        it('should prepare correct relationship id field', () => {
          const field = entity4.primaryKey.fields[1];
          expect(field).to.deep.include({
            ...entity1.primaryKey.fields[0],
            fieldName: 'otherEntity1Id',
            fieldNameCapitalized: 'OtherEntity1Id',
            columnName: 'other_entity1_id',
            derivedPath: ['otherEntity1', 'id'],
            path: ['otherEntity1', 'id'],
            relationshipsPath: [entity4.relationships[0]],
            autoGenerate: true,
            derivedEntity: entity1,
            reference: field.reference,
          });
        });

        it('should prepare correct relationship id ids', () => {
          const field = entity4.primaryKey.ids[1];
          expect(field).to.deep.include({
            name: 'otherEntity1Id',
            nameCapitalized: 'OtherEntity1Id',
            nameDotted: 'otherEntity1.id',
            nameDottedAsserted: 'otherEntity1!.id!',
            setter: 'setOtherEntity1Id',
            getter: 'getOtherEntity1Id',
          });
        });

        it('should prepare correct relationship id with derived primaryKey field', () => {
          const field = entity4.primaryKey.fields[2];
          expect(field).to.deep.include({
            ...entity3.primaryKey.fields[0],
            derived: true,
            fieldName: 'otherEntity3Uuid',
            fieldNameCapitalized: 'OtherEntity3Uuid',
            columnName: 'other_entity3_uuid',
            derivedPath: ['otherEntity3', 'uuid'],
            path: ['otherEntity3', 'entity2', 'uuid'],
            relationshipsPath: [entity4.relationships[1], entity3.relationships[0]],
            derivedEntity: entity3,
            reference: field.reference,
          });
        });

        it('should prepare correct relationship id with derived primaryKey field ids', () => {
          const field = entity4.primaryKey.ids[2];
          expect(field).to.deep.include({
            name: 'otherEntity3Uuid',
            nameCapitalized: 'OtherEntity3Uuid',
            nameDotted: 'otherEntity3.uuid',
            nameDottedAsserted: 'otherEntity3!.uuid!',
            setter: 'setOtherEntity3Uuid',
            getter: 'getOtherEntity3Uuid',
          });
        });
      });
    });
  });
});
