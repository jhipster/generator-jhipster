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

import { before, describe, it } from 'esmocha';
import fs from 'node:fs';

import { expect } from 'chai';

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
        expect(() => convertEntitiesToJDL()).to.throw('Entities have to be passed to be converted.');
      });
    });
    describe('when passing entities', () => {
      let jdlObject;

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
          expect(jdlObject.entities.Employee.comment).eq('The Employee entity.');
        });
        it('should parse tableName', () => {
          expect(jdlObject.entities.Employee.tableName).eq('emp');
        });
        it('should parse mandatory fields', () => {
          expect(jdlObject.entities.Country.fields.countryId.type).eq('Long');
          expect(jdlObject.entities.Country.fields.countryName.type).eq('String');
        });
        it('should parse field documentation', () => {
          expect(jdlObject.entities.Country.fields.countryId.comment).eq('The country Id');
          expect(jdlObject.entities.Country.fields.countryName.comment).to.be.undefined;
        });
        it('should parse validations', () => {
          expect(jdlObject.entities.Department.fields.departmentName.validations.required.name).eq('required');
          expect(jdlObject.entities.Department.fields.departmentName.validations.required.value).to.be.undefined;
          expect(jdlObject.entities.Employee.fields.salary.validations.min.value).eq(10000);
          expect(jdlObject.entities.Employee.fields.salary.validations.max.value).eq(1000000);
          expect(jdlObject.entities.Employee.fields.employeeId.validations).to.be.empty;
        });
        it('should parse enums', () => {
          const languageEnum = jdlObject.getEnum('Language');
          expect(languageEnum.name).eq('Language');
          expect(languageEnum.values.has('FRENCH')).to.be.true;
          expect(languageEnum.values.get('FRENCH').value).to.equal('french');
          expect(languageEnum.values.has('ENGLISH')).to.be.true;
          expect(languageEnum.values.has('SPANISH')).to.be.true;
        });
        it('should parse options', () => {
          expect(
            jdlObject.getOptions().filter(option => option.name === DTO && option.value === MAPSTRUCT && option.entityNames.has('Employee'))
              .length,
          ).to.equal(1);
          expect(
            jdlObject
              .getOptions()
              .filter(
                option =>
                  option.name === PAGINATION && option.value === pagination['INFINITE-SCROLL'] && option.entityNames.has('Employee'),
              ).length,
          ).to.equal(1);
          expect(
            jdlObject
              .getOptions()
              .filter(option => option.name === SERVICE && option.value === SERVICE_CLASS && option.entityNames.has('Employee')).length,
          ).to.equal(1);
          expect(
            jdlObject
              .getOptions()
              .filter(option => option.name === SEARCH && option.value === ELASTICSEARCH && option.entityNames.has('Employee')).length,
          ).to.equal(1);
          expect(
            jdlObject
              .getOptions()
              .filter(
                option =>
                  option.name === APPLICATION_TYPE_MICROSERVICE && option.value === 'mymicroservice' && option.entityNames.has('Employee'),
              ).length,
          ).to.equal(1);
          expect(
            jdlObject
              .getOptions()
              .filter(option => option.name === ANGULAR_SUFFIX && option.value === 'myentities' && option.entityNames.has('Employee'))
              .length,
          ).to.equal(1);
          expect(
            jdlObject.getOptions().filter(option => option.name === unaryOptions.NO_FLUENT_METHOD && option.entityNames.has('Employee'))
              .length,
          ).to.equal(1);
          expect(
            jdlObject.getOptions().filter(option => option.name === unaryOptions.FILTER && option.entityNames.has('Employee')).length,
          ).to.equal(1);
          expect(
            jdlObject.getOptions().filter(option => option.name === unaryOptions.READ_ONLY && option.entityNames.has('Employee')).length,
          ).to.equal(1);
          expect(
            jdlObject.getOptions().filter(option => option.name === unaryOptions.EMBEDDED && option.entityNames.has('Employee')).length,
          ).to.equal(1);
        });
      });

      describe('when parsing JSON entities to JDL', () => {
        it('should parse unidirectional OneToOne relationships', () => {
          expect(jdlObject.relationships.getOneToOne('OneToOne_Department{location}_Location')).not.to.be.undefined;
        });
        it('should parse bidirectional OneToOne relationships', () => {
          expect(jdlObject.relationships.getOneToOne('OneToOne_Country{region}_Region{country}')).not.to.be.undefined;
        });
        it('should parse bidirectional ManyToOne relationships', () => {
          expect(jdlObject.relationships.getManyToOne('ManyToOne_Employee{department(foo)}_Department{employee}')).not.to.be.undefined;
        });
        it('should parse bidirectional OneToMany relationships', () => {
          expect(jdlObject.relationships.getOneToMany('OneToMany_Employee{job}_Job{employee}')).not.to.be.undefined;
        });
        it('should parse unidirectional ManyToOne relationships', () => {
          expect(jdlObject.relationships.getManyToOne('ManyToOne_Employee{manager}_Employee')).not.to.be.undefined;
        });
        it('should parse ManyToMany relationships', () => {
          expect(jdlObject.relationships.getManyToMany('ManyToMany_Job{task(title)}_Task{job}')).not.to.be.undefined;
        });
        it('should parse comments in relationships for owner', () => {
          const relationship = jdlObject.relationships.getManyToOne('ManyToOne_Employee{department(foo)}_Department{employee}');
          expect(relationship.commentInFrom).to.equal('Another side of the same relationship');
          expect(relationship.commentInTo).to.equal('A relationship');
        });
        it('should parse comments in relationships for owned', () => {
          const entities = new Map([
            ['Department', readJsonEntity('Department')],
            ['Employee', readJsonEntity('Employee')],
          ]);
          const jdlObject = convertEntitiesToJDL(entities);
          const relationship = jdlObject.relationships.getManyToOne('ManyToOne_Employee{department(foo)}_Department{employee}');
          expect(relationship!.commentInFrom).to.equal('Another side of the same relationship');
          expect(relationship!.commentInTo).to.equal('A relationship');
        });
        it('should parse required relationships in owner', () => {
          const relationship = jdlObject.relationships.getManyToOne('ManyToOne_Employee{department(foo)}_Department{employee}');
          expect(relationship.isInjectedFieldInFromRequired).to.be.undefined;
          expect(relationship.isInjectedFieldInToRequired).to.be.true;
        });
        it('should parse required relationships in owned', () => {
          const relationship = jdlObject.relationships.getManyToMany('ManyToMany_Job{task(title)}_Task{job}');
          expect(relationship.isInjectedFieldInToRequired).to.be.true;
          expect(relationship.isInjectedFieldInFromRequired).to.be.undefined;
        });
      });

      describe('when parsing entities with relationships to User', () => {
        describe('when skipUserManagement flag is not set', () => {
          describe('when there is no User.json entity', () => {
            let jdlObject;

            before(() => {
              jdlObject = convertEntitiesToJDL(new Map([['Country', readJsonEntity('Country')]]));
            });

            it('should parse relationships to the JHipster managed User entity', () => {
              expect(jdlObject.relationships.getOneToOne('OneToOne_Country{user}_User')).not.to.be.undefined;
            });
          });
        });
        describe('without relationship', () => {
          let jdlObject;

          before(() => {
            jdlObject = convertEntitiesToJDL(new Map([['CassBankAccount', readJsonEntity('CassBankAccount')]]));
          });

          it('should parse the tableName', () => {
            expect(jdlObject.entities.CassBankAccount.tableName).eq('cassBankAccount');
          });
        });
      });

      describe('when parsing relationships with options', () => {
        describe('such as builtInEntity', () => {
          it('should accept it', () => {
            expect(jdlObject.relationships.getOneToOne('OneToOne_Country{region}_Region{country}').options.global[BUILT_IN_ENTITY]).to.be
              .true;
          });
        });
      });
    });
    describe('when parsing relationships including the User entity', () => {
      let entities;

      before(() => {
        entities = new Map([
          [
            'TestEntity',
            JSON.parse(
              fs.readFileSync(getTestFile('json_to_jdl_converter', 'with_user', '.jhipster', 'TestEntity.json'), 'utf-8').toString(),
            ),
          ],
        ]);
      });

      it('should not fail', () => {
        expect(() => convertEntitiesToJDL(entities)).not.to.throw();
      });
    });
    describe('when parsing relationships including the Authority entity', () => {
      let entities;

      before(() => {
        entities = new Map([
          [
            'TestEntity',
            JSON.parse(
              fs.readFileSync(getTestFile('json_to_jdl_converter', 'with_authority', '.jhipster', 'TestEntity.json'), 'utf-8').toString(),
            ),
          ],
        ]);
      });

      it('should not fail', () => {
        expect(() => convertEntitiesToJDL(entities)).not.to.throw();
      });
    });
  });
});

function readJsonEntity(entityName) {
  return JSON.parse(fs.readFileSync(getTestFile('jhipster_app', '.jhipster', `${entityName}.json`), 'utf-8').toString());
}
