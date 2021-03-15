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

const chai = require('chai');
const chaiSubset = require('chai-subset');

chai.use(chaiSubset);

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
            fieldName: 'id',
            fieldType: 'CustomType',
            id: true,
          });
          expect(entity.primaryKey.ids).to.have.lengthOf(1);
          expect(entity.primaryKey.ids[0].usedRelationships).to.have.lengthOf(0);
          expect(entity.primaryKey).to.containSubset({
            name: 'id',
            nameCapitalized: 'Id',
            type: 'CustomType',
            tsType: 'string',
            derived: false,
            composite: false,
            autoGenerate: false,
            ids: [
              {
                field: entity.fields[0],
                name: 'id',
                nameDotted: 'id',
                nameCapitalized: 'Id',
                nameDottedAsserted: 'id!',
                columnName: 'id',
                getter: 'getId',
                setter: 'setId',
                entity: {
                  name: entity.name,
                },
                autoGenerate: false,
                usedRelationships: [],
              },
            ],
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
            { fieldName: 'uuid', fieldType: 'UUID', id: true, autoGenerate: true },
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
          expect(entity.primaryKey.ids).to.have.lengthOf(1);
          expect(entity.primaryKey.ids[0].usedRelationships).to.have.lengthOf(0);
          expect(entity.primaryKey).to.containSubset({
            name: 'uuid',
            nameCapitalized: 'Uuid',
            type: 'UUID',
            tsType: 'string',
            derived: false,
            composite: false,
            autoGenerate: true,
            ids: [
              {
                field: entity.fields[1],
                name: 'uuid',
                nameDotted: 'uuid',
                nameCapitalized: 'Uuid',
                nameDottedAsserted: 'uuid!',
                getter: 'getUuid',
                setter: 'setUuid',
                entity: {
                  name: entity.name,
                },
                autoGenerate: true,
                usedRelationships: [],
              },
            ],
          });
        });
      });
      describe('with multiple @Id relationships and field', () => {
        let entity1 = {
          ...entityDefaultConfig,
          name: 'Entity1',
          changelogDate: formatDateForChangelog(new Date()),
          fields: [{ fieldName: 'id', fieldType: 'String', id: true }],
        };
        let entity2 = {
          ...entityDefaultConfig,
          name: 'Entity2',
          changelogDate: formatDateForChangelog(new Date()),
          fields: [{ fieldName: 'uuid', fieldType: 'UUID', id: true, autoGenerate: true }],
        };
        let entity3 = {
          ...entityDefaultConfig,
          name: 'Entity3',
          changelogDate: formatDateForChangelog(new Date()),
          relationships: [{ relationshipName: 'entity2', relationshipType: 'one-to-one', id: true, otherEntity: entity2 }],
        };
        let entity4 = {
          ...entityDefaultConfig,
          name: 'Entity4',
          changelogDate: formatDateForChangelog(new Date()),
          fields: [{ fieldName: 'uuid', fieldType: 'UUID', id: true, autoGenerate: false }],
          relationships: [
            { relationshipName: 'otherEntity1', id: true, otherEntity: entity1, relationshipType: 'many-to-one' },
            { relationshipName: 'otherEntity3', id: true, otherEntity: entity3, relationshipType: 'many-to-one' },
          ],
        };
        beforeEach(() => {
          entity1 = prepareEntityForTemplates(entity1, defaultGenerator);
          entity2 = prepareEntityForTemplates(entity2, defaultGenerator);
          entity3 = prepareEntityForTemplates(entity3, defaultGenerator);
          entity4 = prepareEntityForTemplates(entity4, defaultGenerator);
        });
        it('should compute primaryKeys correctly', () => {
          expect(entity1.primaryKey.ids).to.have.lengthOf(1);
          expect(entity1.primaryKey.ids[0].usedRelationships).to.have.lengthOf(0);
          expect(entity1.primaryKey).to.containSubset({
            name: 'id',
            nameCapitalized: 'Id',
            type: 'String',
            tsType: 'string',
            derived: false,
            composite: false,
            autoGenerate: false,
            ids: [
              {
                field: entity1.fields[0],
                name: 'id',
                nameDotted: 'id',
                nameCapitalized: 'Id',
                nameDottedAsserted: 'id!',
                columnName: 'id',
                getter: 'getId',
                setter: 'setId',
                entity: {
                  name: entity1.name,
                },
                autoGenerate: false,
                usedRelationships: [],
              },
            ],
          });

          expect(entity2.primaryKey.ids).to.have.lengthOf(1);
          expect(entity2.primaryKey.ids[0].usedRelationships).to.have.lengthOf(0);
          expect(entity2.primaryKey).to.containSubset({
            name: 'uuid',
            nameCapitalized: 'Uuid',
            type: 'UUID',
            tsType: 'string',
            derived: false,
            composite: false,
            autoGenerate: true,
            ids: [
              {
                field: entity2.fields[0],
                name: 'uuid',
                nameDotted: 'uuid',
                nameCapitalized: 'Uuid',
                nameDottedAsserted: 'uuid!',
                columnName: 'uuid',
                getter: 'getUuid',
                setter: 'setUuid',
                entity: {
                  name: entity2.name,
                },
                autoGenerate: true,
                usedRelationships: [],
              },
            ],
          });

          expect(entity3.primaryKey.ids).to.have.lengthOf(1);
          expect(entity3.primaryKey.ids[0].usedRelationships).to.have.lengthOf(1);
          expect(entity3.fields[0]).to.containSubset({
            fieldName: 'uuid',
            id: true,
          });
          expect(entity3.primaryKey).to.containSubset({
            name: 'uuid',
            nameCapitalized: 'Uuid',
            type: 'UUID',
            tsType: 'string',
            derived: true,
            composite: false,
            autoGenerate: true,
            ids: [
              {
                field: entity2.primaryKey.originalFields[0],
                name: 'uuid',
                nameDotted: 'entity2.uuid',
                nameCapitalized: 'Uuid',
                nameDottedAsserted: 'entity2!.uuid!',
                columnName: 'uuid',
                getter: 'getUuid',
                setter: 'setUuid',
                entity: {
                  name: entity2.name,
                },
                autoGenerate: true,
                usedRelationships: [{ relationshipName: 'entity2', id: true, otherEntity: entity2 }],
              },
            ],
          });

          expect(entity4.primaryKey.ids).to.have.lengthOf(3);
          expect(entity4.primaryKey.ids[0].usedRelationships).to.have.lengthOf(0);
          expect(entity4.primaryKey.ids[1].usedRelationships).to.have.lengthOf(1);
          expect(entity4.primaryKey.ids[2].usedRelationships).to.have.lengthOf(2);
          expect(entity4.primaryKey).to.containSubset({
            name: 'id',
            nameCapitalized: 'Id',
            type: 'Entity4Id',
            tsType: 'string',
            derived: false,
            composite: true,
            autoGenerate: false,
            ids: [
              {
                field: entity4.fields[0],
                name: 'uuid',
                nameDotted: 'uuid',
                nameCapitalized: 'Uuid',
                nameDottedAsserted: 'uuid!',
                columnName: 'uuid',
                getter: 'getUuid',
                setter: 'setUuid',
                entity: {
                  name: entity4.name,
                },
                autoGenerate: false,
                usedRelationships: [],
              },
              {
                field: entity1.fields[0],
                name: 'otherEntity1Id',
                nameDotted: 'otherEntity1.id',
                nameCapitalized: 'OtherEntity1Id',
                nameDottedAsserted: 'otherEntity1!.id!',
                columnName: 'other_entity1_id',
                getter: 'getOtherEntity1Id',
                setter: 'setOtherEntity1Id',
                entity: {
                  name: entity1.name,
                },
                autoGenerate: false,
                usedRelationships: [{ relationshipName: 'otherEntity1', id: true, otherEntity: entity1 }],
              },
              {
                field: entity2.fields[0],
                name: 'otherEntity3Uuid',
                nameDotted: 'otherEntity3.entity2.uuid',
                nameCapitalized: 'OtherEntity3Uuid',
                nameDottedAsserted: 'otherEntity3!.entity2!.uuid!',
                columnName: 'other_entity3_uuid',
                getter: 'getOtherEntity3Uuid',
                setter: 'setOtherEntity3Uuid',
                entity: {
                  name: entity2.name,
                },
                autoGenerate: false,
                usedRelationships: [
                  { relationshipName: 'otherEntity3', id: true, otherEntity: entity3 },
                  { relationshipName: 'entity2', id: true, otherEntity: entity2 },
                ],
              },
            ],
          });
        });
      });
    });
  });
});
