/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import { beforeEach, describe, it, expect as jestExpect } from 'esmocha';
import { expect } from 'chai';
import exportEntities from '../exporters/jhipster-entity-exporter.js';
import { applicationTypes } from '../../core/built-in-options/index.js';

import { doesDirectoryExist } from '../../core/utils/file-utils.js';
import { basicHelpers as helpers } from '../../../../lib/testing/index.js';
import { entityOptions } from '../../../jhipster/index.js';

const { MapperTypes, PaginationTypes, ServiceTypes } = entityOptions;
const { MONOLITH, MICROSERVICE } = applicationTypes;
const { SERVICE_CLASS } = ServiceTypes;
const NO_DTO = MapperTypes.NO;
const NO_PAGINATION = PaginationTypes.NO;
const NO_SERVICE = ServiceTypes.NO;

describe('jdl - JHipsterEntityExporter', () => {
  beforeEach(async () => {
    await helpers.prepareTemporaryDir();
  });

  describe('exportEntities', () => {
    describe('when passing invalid parameters', () => {
      describe('such as undefined', () => {
        it('should fail', () => {
          expect(() => {
            // @ts-expect-error
            exportEntities();
          }).to.throw('Entities have to be passed to be exported.');
        });
      });
    });
    describe('when passing valid arguments', () => {
      describe('for only entities and a monolith app', () => {
        let entities;
        let returned;

        beforeEach(() => {
          entities = [
            {
              name: 'A',
              fields: [
                {
                  fieldName: 'myEnum',
                  fieldType: 'MyEnum',
                  fieldValues: 'FRENCH,ENGLISH',
                },
              ],
              relationships: [],
              changelogDate: '42',
              documentation: '',
              entityTableName: 'a',
              dto: NO_DTO,
              pagination: NO_PAGINATION,
              service: NO_SERVICE,
              fluentMethods: true,
              jpaMetamodelFiltering: false,
              applications: [],
            },
          ];
          returned = exportEntities({
            entities,
            application: {
              name: 'MyApp',
              type: MONOLITH,
            },
          });
        });

        it('should return the exported entities', () => {
          expect(returned).to.deep.equal(entities);
        });
      });
      describe('when not exporting entities', () => {
        let returned;

        beforeEach(() => {
          returned = exportEntities({
            entities: [],
            application: {
              name: 'MyApp',
              type: MONOLITH,
            },
          });
        });
        it('should return an empty list', () => {
          jestExpect(returned).toMatchInlineSnapshot('[]');
        });
        it('should not create a .jhipster folder', () => {
          expect(doesDirectoryExist('.jhipster')).to.be.false;
        });
      });
      describe('when exporting the same entity', () => {
        let entities;
        let returned;

        beforeEach(() => {
          entities = [
            {
              name: 'A',
              fields: [
                {
                  fieldName: 'myEnum',
                  fieldType: 'MyEnum',
                  fieldValues: 'FRENCH,ENGLISH',
                },
              ],
              relationships: [],
              changelogDate: '42',
              documentation: '',
              entityTableName: 'a',
              dto: NO_DTO,
              pagination: NO_PAGINATION,
              service: NO_SERVICE,
              fluentMethods: true,
              jpaMetamodelFiltering: false,
              applications: [],
            },
          ];
          returned = exportEntities({
            entities,
            application: {
              name: 'MyApp',
              type: MONOLITH,
            },
          });
        });

        it('should return the exported entities', () => {
          jestExpect(returned).toMatchInlineSnapshot(`
[
  {
    "applications": [],
    "changelogDate": "42",
    "documentation": "",
    "dto": "no",
    "entityTableName": "a",
    "fields": [
      {
        "fieldName": "myEnum",
        "fieldType": "MyEnum",
        "fieldValues": "FRENCH,ENGLISH",
      },
    ],
    "fluentMethods": true,
    "jpaMetamodelFiltering": false,
    "name": "A",
    "pagination": "no",
    "relationships": [],
    "service": "no",
  },
]
`);
        });
      });
      describe('when passing an application name and application type', () => {
        describe('inside a monolith', () => {
          let entities;
          let returned;

          beforeEach(() => {
            entities = [
              {
                name: 'Client',
                fields: [],
                relationships: [
                  {
                    relationshipType: 'many-to-one',
                    relationshipName: 'location',
                    otherEntityName: 'location',
                  },
                ],
                changelogDate: '20180303092308',
                entityTableName: 'client',
                dto: NO_DTO,
                pagination: NO_PAGINATION,
                service: SERVICE_CLASS,
                jpaMetamodelFiltering: true,
                fluentMethods: true,
                applications: '*',
                microserviceName: 'client',
              },
              {
                name: 'Location',
                fields: [],
                relationships: [
                  {
                    relationshipType: 'one-to-many',
                    relationshipName: 'clients',
                    otherEntityName: 'client',
                    otherEntityRelationshipName: 'location',
                  },
                ],
                changelogDate: '20180303092309',
                entityTableName: 'location',
                dto: NO_DTO,
                pagination: NO_PAGINATION,
                service: SERVICE_CLASS,
                jpaMetamodelFiltering: true,
                fluentMethods: true,
                applications: '*',
                microserviceName: 'client',
              },
              {
                name: 'LocalStore',
                fields: [],
                relationships: [
                  {
                    relationshipType: 'one-to-many',
                    relationshipName: 'products',
                    otherEntityName: 'product',
                    otherEntityRelationshipName: 'store',
                  },
                ],
                changelogDate: '20180303092310',
                entityTableName: 'local_store',
                dto: NO_DTO,
                pagination: NO_PAGINATION,
                service: SERVICE_CLASS,
                jpaMetamodelFiltering: true,
                fluentMethods: true,
                applications: '*',
                microserviceName: 'store',
              },
              {
                name: 'Product',
                fields: [
                  {
                    fieldName: 'name',
                    fieldType: 'String',
                  },
                ],
                relationships: [
                  {
                    relationshipType: 'many-to-one',
                    relationshipName: 'store',
                    otherEntityName: 'localStore',
                  },
                ],
                changelogDate: '20180303092311',
                entityTableName: 'product',
                dto: NO_DTO,
                pagination: NO_PAGINATION,
                service: SERVICE_CLASS,
                jpaMetamodelFiltering: true,
                fluentMethods: true,
                applications: '*',
                microserviceName: 'store',
              },
            ];
            returned = exportEntities({
              entities,
              application: {
                name: 'client',
                type: MONOLITH,
              },
            });
          });

          it('should return the exported entities', () => {
            jestExpect(returned).toMatchInlineSnapshot(`
[
  {
    "applications": "*",
    "changelogDate": "20180303092308",
    "dto": "no",
    "entityTableName": "client",
    "fields": [],
    "fluentMethods": true,
    "jpaMetamodelFiltering": true,
    "microserviceName": "client",
    "name": "Client",
    "pagination": "no",
    "relationships": [
      {
        "otherEntityName": "location",
        "relationshipName": "location",
        "relationshipType": "many-to-one",
      },
    ],
    "service": "serviceClass",
  },
  {
    "applications": "*",
    "changelogDate": "20180303092309",
    "dto": "no",
    "entityTableName": "location",
    "fields": [],
    "fluentMethods": true,
    "jpaMetamodelFiltering": true,
    "microserviceName": "client",
    "name": "Location",
    "pagination": "no",
    "relationships": [
      {
        "otherEntityName": "client",
        "otherEntityRelationshipName": "location",
        "relationshipName": "clients",
        "relationshipType": "one-to-many",
      },
    ],
    "service": "serviceClass",
  },
  {
    "applications": "*",
    "changelogDate": "20180303092310",
    "dto": "no",
    "entityTableName": "local_store",
    "fields": [],
    "fluentMethods": true,
    "jpaMetamodelFiltering": true,
    "microserviceName": "store",
    "name": "LocalStore",
    "pagination": "no",
    "relationships": [
      {
        "otherEntityName": "product",
        "otherEntityRelationshipName": "store",
        "relationshipName": "products",
        "relationshipType": "one-to-many",
      },
    ],
    "service": "serviceClass",
  },
  {
    "applications": "*",
    "changelogDate": "20180303092311",
    "dto": "no",
    "entityTableName": "product",
    "fields": [
      {
        "fieldName": "name",
        "fieldType": "String",
      },
    ],
    "fluentMethods": true,
    "jpaMetamodelFiltering": true,
    "microserviceName": "store",
    "name": "Product",
    "pagination": "no",
    "relationships": [
      {
        "otherEntityName": "localStore",
        "relationshipName": "store",
        "relationshipType": "many-to-one",
      },
    ],
    "service": "serviceClass",
  },
]
`);
          });
        });
        describe('inside a microservice', () => {
          describe('and when entities without the microservice option are passed', () => {
            let entities;
            let returnedContent;

            beforeEach(() => {
              entities = [
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092920',
                  entityTableName: 'a',
                  dto: NO_DTO,
                  pagination: NO_PAGINATION,
                  service: NO_SERVICE,
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  applications: '*',
                  name: 'A',
                },
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092921',
                  entityTableName: 'b',
                  dto: NO_DTO,
                  pagination: NO_PAGINATION,
                  service: NO_SERVICE,
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  applications: '*',
                  name: 'B',
                },
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092922',
                  entityTableName: 'c',
                  dto: NO_DTO,
                  pagination: NO_PAGINATION,
                  service: NO_SERVICE,
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  applications: '*',
                  name: 'C',
                },
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092923',
                  entityTableName: 'd',
                  dto: NO_DTO,
                  pagination: NO_PAGINATION,
                  service: NO_SERVICE,
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  applications: '*',
                  name: 'D',
                },
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092924',
                  entityTableName: 'e',
                  dto: NO_DTO,
                  pagination: NO_PAGINATION,
                  service: NO_SERVICE,
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  applications: '*',
                  name: 'E',
                },
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092925',
                  entityTableName: 'f',
                  dto: NO_DTO,
                  pagination: NO_PAGINATION,
                  service: NO_SERVICE,
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  applications: '*',
                  name: 'F',
                },
                {
                  fields: [],
                  relationships: [],
                  changelogDate: '20180303092926',
                  entityTableName: 'g',
                  dto: NO_DTO,
                  pagination: NO_PAGINATION,
                  service: NO_SERVICE,
                  jpaMetamodelFiltering: false,
                  fluentMethods: true,
                  applications: '*',
                  name: 'G',
                },
              ];
              returnedContent = exportEntities({
                entities,
                application: {
                  name: 'client',
                  type: MICROSERVICE,
                },
              });
            });

            it('should return every entity', () => {
              expect(returnedContent.length).to.be.equal(7);
              ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(entityName => {
                expect(returnedContent.filter(entity => entity.name === entityName) !== undefined).to.be.true;
              });
            });
          });
          describe('and when microservice entities are passed', () => {
            let entities;
            let returnedContent;

            beforeEach(() => {
              entities = [
                {
                  fields: [],
                  relationships: [[Object]],
                  changelogDate: '20180303093006',
                  entityTableName: 'client',
                  dto: NO_DTO,
                  pagination: NO_PAGINATION,
                  service: SERVICE_CLASS,
                  jpaMetamodelFiltering: true,
                  fluentMethods: true,
                  applications: '*',
                  microserviceName: 'client',
                  name: 'Client',
                },
                {
                  fields: [],
                  relationships: [[Object]],
                  changelogDate: '20180303093007',
                  entityTableName: 'location',
                  dto: NO_DTO,
                  pagination: NO_PAGINATION,
                  service: SERVICE_CLASS,
                  jpaMetamodelFiltering: true,
                  fluentMethods: true,
                  applications: '*',
                  microserviceName: 'client',
                  name: 'Location',
                },
                {
                  fields: [],
                  relationships: [[Object]],
                  changelogDate: '20180303093008',
                  entityTableName: 'local_store',
                  dto: NO_DTO,
                  pagination: NO_PAGINATION,
                  service: SERVICE_CLASS,
                  jpaMetamodelFiltering: true,
                  fluentMethods: true,
                  applications: '*',
                  microserviceName: 'store',
                  name: 'LocalStore',
                },
                {
                  fields: [[Object]],
                  relationships: [[Object]],
                  changelogDate: '20180303093009',
                  entityTableName: 'product',
                  dto: NO_DTO,
                  pagination: NO_PAGINATION,
                  service: SERVICE_CLASS,
                  jpaMetamodelFiltering: true,
                  fluentMethods: true,
                  applications: '*',
                  microserviceName: 'store',
                  name: 'Product',
                },
              ];
              returnedContent = exportEntities({
                entities,
                application: {
                  name: 'client',
                  type: MICROSERVICE,
                },
              });
            });

            it('should return the entities that should be inside the microservice', () => {
              expect(returnedContent.length).to.be.equal(2);
            });
          });
        });
      });
    });
  });
});
