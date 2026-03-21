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

import { before, describe, expect, it } from 'esmocha';
import fs from 'node:fs';

import { APPLICATION_TYPE_MICROSERVICE } from '../../core/application-types.ts';
import { getTestFile } from '../core/__test-support__/index.ts';
import { binaryOptions, relationshipOptions, unaryOptions } from '../core/built-in-options/index.ts';

import { convertEntitiesToJDL } from './json-to-jdl-entity-converter.ts';

const { BUILT_IN_ENTITY } = relationshipOptions;

const {
  Options: { DTO, SEARCH, PAGINATION, ANGULAR_SUFFIX, SERVICE },
  Values: {
    dto: { MAPSTRUCT },
    pagination,
    service: { SERVICE_CLASS },
    search: { ELASTICSEARCH },
  },
} = binaryOptions;

describe('jdl - JSONToJDLEntityConverter', () => {
  describe('convertEntitiesToJDL', () => {
    describe('when not passing entities', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => convertEntitiesToJDL()).toThrow('Entities have to be passed to be converted.');
      });
    });
    describe('when passing entities', () => {
      let jdlObject: ReturnType<typeof convertEntitiesToJDL>;

      before(() => {
        const entities = new Map([
          ['Employee', readJsonEntity('Employee')],
          ['Country', readJsonEntity('Country')],
          ['Department', readJsonEntity('Department')],
          ['JobHistory', readJsonEntity('JobHistory')],
          ['Location', readJsonEntity('Location')],
          ['Region', readJsonEntity('Region')],
          ['Job', readJsonEntity('Job')],
          ['Task', readJsonEntity('Task')],
        ]);
        jdlObject = convertEntitiesToJDL(entities);
      });

      describe('when parsing a JSON entity to JDL', () => {
        it('should parse entity documentation', () => {
          expect(jdlObject.entities.Employee.comment).toBe('The Employee entity.');
        });
        it('should parse tableName', () => {
          expect(jdlObject.entities.Employee.tableName).toBe('emp');
        });
        it('should parse mandatory fields', () => {
          expect(jdlObject.entities.Country.fields.countryId.type).toBe('Long');
          expect(jdlObject.entities.Country.fields.countryName.type).toBe('String');
        });
        it('should parse field documentation', () => {
          expect(jdlObject.entities.Country.fields.countryId.comment).toBe('The country Id');
          expect(jdlObject.entities.Country.fields.countryName.comment).toBeUndefined();
        });
        it('should parse validations', () => {
          expect(jdlObject.entities.Department.fields.departmentName.validations.required.name).toBe('required');
          expect(jdlObject.entities.Department.fields.departmentName.validations.required.value).toBeUndefined();
          expect(jdlObject.entities.Employee.fields.salary.validations.min.value).toBe(10000);
          expect(jdlObject.entities.Employee.fields.salary.validations.max.value).toBe(1000000);
          expect(jdlObject.entities.Employee.fields.employeeId.validations).toEqual({});
        });
        it('should parse field options', () => {
          const entities = new Map<string, any>([
            [
              'TestEntity',
              {
                fields: [
                  { fieldName: 'myId', fieldType: 'Long', options: { id: true } },
                  { fieldName: 'customField', fieldType: 'String', options: { customAnnotation: 'customValue' } },
                  { fieldName: 'noOptionsField', fieldType: 'String' },
                ],
                relationships: [],
              },
            ],
          ]);
          const result = convertEntitiesToJDL(entities);
          expect(result.entities.TestEntity.fields.myId.options).toEqual({ id: true });
          expect(result.entities.TestEntity.fields.customField.options).toEqual({ customAnnotation: 'customValue' });
          expect(result.entities.TestEntity.fields.noOptionsField.options).toEqual({});
        });
        it('should parse enums', () => {
          const languageEnum = jdlObject.getEnum('Language');
          if (!languageEnum) {
            throw new Error('Language enum not found');
          }
          expect(languageEnum.name).toBe('Language');
          expect(languageEnum.values.has('FRENCH')).toBe(true);
          expect(languageEnum.values.get('FRENCH')?.value).toBe('french');
          expect(languageEnum.values.has('ENGLISH')).toBe(true);
          expect(languageEnum.values.has('SPANISH')).toBe(true);
        });
        it('should parse options', () => {
          expect(
            // @ts-expect-error FIXME
            jdlObject.getOptions().filter(option => option.name === DTO && option.value === MAPSTRUCT && option.entityNames.has('Employee'))
              .length,
          ).toBe(1);
          expect(
            jdlObject.getOptions().filter(
              option =>
                // @ts-expect-error FIXME
                option.name === PAGINATION && option.value === pagination['INFINITE-SCROLL'] && option.entityNames.has('Employee'),
            ).length,
          ).toBe(1);
          expect(
            jdlObject
              .getOptions()
              // @ts-expect-error FIXME
              .filter(option => option.name === SERVICE && option.value === SERVICE_CLASS && option.entityNames.has('Employee')).length,
          ).toBe(1);
          expect(
            jdlObject
              .getOptions()
              // @ts-expect-error FIXME
              .filter(option => option.name === SEARCH && option.value === ELASTICSEARCH && option.entityNames.has('Employee')).length,
          ).toBe(1);
          expect(
            jdlObject.getOptions().filter(
              option =>
                // @ts-expect-error FIXME
                option.name === APPLICATION_TYPE_MICROSERVICE && option.value === 'mymicroservice' && option.entityNames.has('Employee'),
            ).length,
          ).toBe(1);
          expect(
            jdlObject
              .getOptions()
              // @ts-expect-error FIXME
              .filter(option => option.name === ANGULAR_SUFFIX && option.value === 'myentities' && option.entityNames.has('Employee'))
              .length,
          ).toBe(1);
          expect(
            jdlObject.getOptions().filter(option => option.name === unaryOptions.NO_FLUENT_METHOD && option.entityNames.has('Employee'))
              .length,
          ).toBe(1);
          expect(
            jdlObject.getOptions().filter(option => option.name === unaryOptions.FILTER && option.entityNames.has('Employee')).length,
          ).toBe(1);
          expect(
            jdlObject.getOptions().filter(option => option.name === unaryOptions.READ_ONLY && option.entityNames.has('Employee')).length,
          ).toBe(1);
          expect(
            jdlObject.getOptions().filter(option => option.name === unaryOptions.EMBEDDED && option.entityNames.has('Employee')).length,
          ).toBe(1);
        });
      });

      describe('when parsing JSON entities to JDL', () => {
        it('should parse unidirectional OneToOne relationships', () => {
          expect(jdlObject.relationships.getOneToOne('OneToOne_Department{location}_Location')).not.toBeUndefined();
        });
        it('should parse bidirectional OneToOne relationships', () => {
          expect(jdlObject.relationships.getOneToOne('OneToOne_Country{region}_Region{country}')).not.toBeUndefined();
        });
        it('should parse bidirectional ManyToOne relationships', () => {
          expect(jdlObject.relationships.getManyToOne('ManyToOne_Employee{department(foo)}_Department{employee}')).not.toBeUndefined();
        });
        it('should parse bidirectional OneToMany relationships', () => {
          expect(jdlObject.relationships.getOneToMany('OneToMany_Employee{job}_Job{employee}')).not.toBeUndefined();
        });
        it('should parse unidirectional ManyToOne relationships', () => {
          expect(jdlObject.relationships.getManyToOne('ManyToOne_Employee{manager}_Employee')).not.toBeUndefined();
        });
        it('should parse ManyToMany relationships', () => {
          expect(jdlObject.relationships.getManyToMany('ManyToMany_Job{task(title)}_Task{job}')).not.toBeUndefined();
        });
        it('should parse comments in relationships for owner', () => {
          const relationship = jdlObject.relationships.getManyToOne('ManyToOne_Employee{department(foo)}_Department{employee}');
          if (!relationship) {
            throw new Error('Relationship not found');
          }
          expect(relationship.commentInFrom).toBe('Another side of the same relationship');
          expect(relationship.commentInTo).toBe('A relationship');
        });
        it('should parse comments in relationships for owned', () => {
          const entities = new Map([
            ['Department', readJsonEntity('Department')],
            ['Employee', readJsonEntity('Employee')],
          ]);
          const jdlObject = convertEntitiesToJDL(entities);
          const relationship = jdlObject.relationships.getManyToOne('ManyToOne_Employee{department(foo)}_Department{employee}');
          expect(relationship!.commentInFrom).toBe('Another side of the same relationship');
          expect(relationship!.commentInTo).toBe('A relationship');
        });
        it('should parse destination-side relationship options', () => {
          const entities = new Map<string, any>([
            [
              'EntityA',
              {
                fields: [{ fieldName: 'name', fieldType: 'String' }],
                relationships: [
                  {
                    relationshipType: 'one-to-many',
                    relationshipName: 'entityB',
                    otherEntityName: 'entityB',
                    relationshipSide: 'left',
                    otherEntityRelationshipName: 'entityA',
                  },
                ],
              },
            ],
            [
              'EntityB',
              {
                fields: [{ fieldName: 'name', fieldType: 'String' }],
                relationships: [
                  {
                    relationshipType: 'many-to-one',
                    relationshipName: 'entityA',
                    otherEntityName: 'entityA',
                    relationshipSide: 'right',
                    otherEntityRelationshipName: 'entityB',
                    options: { destAnnotation: true },
                  },
                ],
              },
            ],
          ]);
          const result = convertEntitiesToJDL(entities);
          const relationship = result.relationships.getOneToMany('OneToMany_EntityA{entityB}_EntityB{entityA}');
          expect(relationship).not.toBeUndefined();
          expect(relationship!.options.destination).toEqual({ destAnnotation: true });
        });
        it('should parse required relationships in owner', () => {
          const relationship = jdlObject.relationships.getManyToOne('ManyToOne_Employee{department(foo)}_Department{employee}');
          if (!relationship) {
            throw new Error('Relationship not found');
          }
          expect(relationship.isInjectedFieldInFromRequired).toBeUndefined();
          expect(relationship.isInjectedFieldInToRequired).toBe(true);
        });
        it('should parse required relationships in owned', () => {
          const relationship = jdlObject.relationships.getManyToMany('ManyToMany_Job{task(title)}_Task{job}');
          if (!relationship) {
            throw new Error('Relationship not found');
          }
          expect(relationship.isInjectedFieldInToRequired).toBe(true);
          expect(relationship.isInjectedFieldInFromRequired).toBeUndefined();
        });
      });

      describe('when parsing entities with relationships to User', () => {
        describe('when skipUserManagement flag is not set', () => {
          describe('when there is no User.json entity', () => {
            let jdlObject: ReturnType<typeof convertEntitiesToJDL>;

            before(() => {
              jdlObject = convertEntitiesToJDL(new Map([['Country', readJsonEntity('Country')]]));
            });

            it('should parse relationships to the JHipster managed User entity', () => {
              expect(jdlObject.relationships.getOneToOne('OneToOne_Country{user}_User')).not.toBeUndefined();
            });
          });
        });
        describe('without relationship', () => {
          let jdlObject: ReturnType<typeof convertEntitiesToJDL>;

          before(() => {
            jdlObject = convertEntitiesToJDL(new Map([['CassBankAccount', readJsonEntity('CassBankAccount')]]));
          });

          it('should parse the tableName', () => {
            expect(jdlObject.entities.CassBankAccount.tableName).toBe('cassBankAccount');
          });
        });
      });

      describe('when parsing relationships with options', () => {
        describe('such as builtInEntity', () => {
          it('should accept it', () => {
            expect(jdlObject.relationships.getOneToOne('OneToOne_Country{region}_Region{country}')?.options.global[BUILT_IN_ENTITY]).toBe(
              true,
            );
          });
        });
      });
    });
    describe('when parsing relationships including the User entity', () => {
      let entities: Map<string, any>;

      before(() => {
        entities = new Map([
          [
            'TestEntity',
            JSON.parse(fs.readFileSync(getTestFile('json_to_jdl_converter', 'with_user', '.jhipster', 'TestEntity.json'), 'utf-8')),
          ],
        ]);
      });

      it('should not fail', () => {
        expect(() => convertEntitiesToJDL(entities)).not.toThrow();
      });
    });
    describe('when parsing relationships including the Authority entity', () => {
      let entities: Map<string, any>;

      before(() => {
        entities = new Map([
          [
            'TestEntity',
            JSON.parse(fs.readFileSync(getTestFile('json_to_jdl_converter', 'with_authority', '.jhipster', 'TestEntity.json'), 'utf-8')),
          ],
        ]);
      });

      it('should not fail', () => {
        expect(() => convertEntitiesToJDL(entities)).not.toThrow();
      });
    });
  });
});

function readJsonEntity(entityName: string) {
  return JSON.parse(fs.readFileSync(getTestFile('jhipster_app', '.jhipster', `${entityName}.json`), 'utf-8'));
}
