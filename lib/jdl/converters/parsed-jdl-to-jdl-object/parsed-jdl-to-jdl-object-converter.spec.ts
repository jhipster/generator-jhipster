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

import { before, describe, it, expect as jestExpect } from 'esmocha';
import { expect } from 'chai';
import matchEntity from '../../core/matchers/entity-matcher.js';
import { JDLEntity, JDLEnum } from '../../core/models/index.js';
import JDLField from '../../core/models/jdl-field.js';
import JDLValidation from '../../core/models/jdl-validation.js';
import JDLUnaryOption from '../../core/models/jdl-unary-option.js';
import JDLBinaryOption from '../../core/models/jdl-binary-option.js';
import { binaryOptions, unaryOptions, validations } from '../../core/built-in-options/index.js';
import fieldTypes from '../../../jhipster/field-types.js';
import { getTestFile, parseFromConfigurationObject, parseFromContent, parseFromFiles } from '../../core/__test-support__/index.js';
import { entityOptions } from '../../../jhipster/index.js';
import { APPLICATION_TYPE_GATEWAY, APPLICATION_TYPE_MICROSERVICE, APPLICATION_TYPE_MONOLITH } from '../../../core/application-types.js';

const { MapperTypes, ServiceTypes, PaginationTypes } = entityOptions;

const BinaryOptionValues = binaryOptions.Values;
const { DTO } = binaryOptions.Options;
const { MAPSTRUCT } = MapperTypes;
const { SERVICE_CLASS, SERVICE_IMPL } = ServiceTypes;
const { INFINITE_SCROLL, PAGINATION } = PaginationTypes;
const {
  Validations: { REQUIRED, UNIQUE, MINLENGTH, MAXLENGTH },
} = validations;

describe('jdl - ParsedJDLToJDLObjectConverter', () => {
  describe('parse', () => {
    describe('when passing invalid args', () => {
      describe('because there is no parsedContent', () => {
        it('should fail', () => {
          expect(() => {
            // @ts-expect-error
            parseFromConfigurationObject({});
          }).to.throw(/^The parsed JDL content must be passed\.$/);
        });
      });
    });
    describe('when passing valid args', () => {
      describe('with no error', () => {
        let jdlObject;

        before(() => {
          const input = parseFromFiles([getTestFile('complex_jdl.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it('should build a JDLObject', () => {
          expect(jdlObject).not.to.be.null;
          expect(jdlObject.entities.Department).to.deep.equal(
            new JDLEntity({
              name: 'Department',
              tableName: undefined,
              fields: {
                guid: new JDLField({
                  name: 'guid',
                  type: fieldTypes.CommonDBTypes.UUID,
                  validations: {
                    required: new JDLValidation({ name: REQUIRED }),
                  },
                }),
                name: new JDLField({
                  name: 'name',
                  type: fieldTypes.CommonDBTypes.STRING,
                  validations: {
                    required: new JDLValidation({ name: REQUIRED }),
                    unique: new JDLValidation({ name: UNIQUE }),
                  },
                }),
                description: new JDLField({
                  name: 'description',
                  type: fieldTypes.CommonDBTypes.TEXT_BLOB,
                }),
                advertisement: new JDLField({
                  name: 'advertisement',
                  type: fieldTypes.CommonDBTypes.BLOB,
                }),
                logo: new JDLField({
                  name: 'logo',
                  type: fieldTypes.CommonDBTypes.IMAGE_BLOB,
                }),
              },
            }),
          );
          expect(jdlObject.entities.JobHistory).to.deep.eq(
            new JDLEntity({
              name: 'JobHistory',
              tableName: undefined,
              fields: {
                startDate: new JDLField({
                  name: 'startDate',
                  type: fieldTypes.CommonDBTypes.ZONED_DATE_TIME,
                }),
                endDate: new JDLField({
                  name: 'endDate',
                  type: fieldTypes.CommonDBTypes.ZONED_DATE_TIME,
                }),
                language: new JDLField({ name: 'language', type: 'Language' }),
              },
              comment: 'JobHistory comment.',
            }),
          );
          expect(jdlObject.getEnum('JobType')).to.deep.equal(
            new JDLEnum({
              name: 'JobType',
              values: [{ key: 'TYPE1' }, { key: 'TYPE2' }],
            }),
          );
          expect(jdlObject.entities.Job).to.deep.eq(
            new JDLEntity({
              name: 'Job',
              tableName: undefined,
              fields: {
                jobTitle: new JDLField({
                  name: 'jobTitle',
                  type: fieldTypes.CommonDBTypes.STRING,
                  validations: {
                    minlength: new JDLValidation({
                      name: MINLENGTH,
                      value: '5',
                    }),
                    maxlength: new JDLValidation({
                      name: MAXLENGTH,
                      value: '25',
                    }),
                  },
                }),
                jobType: new JDLField({ name: 'jobType', type: 'JobType' }),
                minSalary: new JDLField({
                  name: 'minSalary',
                  type: fieldTypes.CommonDBTypes.LONG,
                }),
                maxSalary: new JDLField({
                  name: 'maxSalary',
                  type: fieldTypes.CommonDBTypes.LONG,
                }),
              },
            }),
          );
          expect(jdlObject.getOptions()).to.deep.eq([
            new JDLUnaryOption({
              name: unaryOptions.SKIP_SERVER,
              entityNames: new Set(['Country']),
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.DTO,
              entityNames: new Set(['Employee']),
              value: BinaryOptionValues.dto.MAPSTRUCT,
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.SERVICE,
              entityNames: new Set(['Employee']),
              value: BinaryOptionValues.service.SERVICE_CLASS,
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.PAGINATION,
              entityNames: new Set(['JobHistory', 'Employee']),
              value: BinaryOptionValues.pagination['INFINITE-SCROLL'],
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.PAGINATION,
              entityNames: new Set(['Job']),
              value: BinaryOptionValues.pagination.PAGINATION,
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.MICROSERVICE,
              entityNames: new Set(['*']),
              value: 'mymicroservice',
            }),
            new JDLBinaryOption({
              name: binaryOptions.Options.SEARCH,
              entityNames: new Set(['Employee']),
              value: BinaryOptionValues.search.ELASTICSEARCH,
            }),
          ]);
        });
      });
      describe('with an application type', () => {
        let input;

        before(() => {
          input = parseFromFiles([getTestFile('invalid_field_type.jdl')]);
        });

        it('should not check for field types', () => {
          parseFromConfigurationObject({
            parsedContent: input,
            applicationType: APPLICATION_TYPE_GATEWAY,
          });
        });
      });
      describe('with a required relationship', () => {
        let jdlObject;
        let relationship;

        before(() => {
          const input = parseFromFiles([getTestFile('required_relationships.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
          relationship = jdlObject.relationships.getOneToOne('OneToOne_A{b}_B{a}');
        });

        it('should add it', () => {
          expect(relationship.isInjectedFieldInFromRequired).to.be.true;
          expect(relationship.isInjectedFieldInToRequired).to.be.false;
        });
      });
      describe("with a field name 'id'", () => {
        let jdlObject;

        before(() => {
          const input = parseFromFiles([getTestFile('id_field.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it('should add it', () => {
          expect(jdlObject.entities.A).to.deep.eq(
            new JDLEntity({
              name: 'A',
              tableName: undefined,
              fields: {
                email: new JDLField({ name: 'email', type: fieldTypes.CommonDBTypes.STRING }),
                id: new JDLField({
                  name: 'id',
                  type: fieldTypes.CommonDBTypes.LONG,
                }),
              },
            }),
          );
        });
      });
      describe('with User entity as destination for a relationship', () => {
        let jdlObject;

        before(() => {
          const input = parseFromFiles([getTestFile('user_entity_to_relationship.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it('should be processed', () => {
          expect(jdlObject.relationships.getManyToOne('ManyToOne_A{user}_User').to).to.equal('User');
          expect(jdlObject.relationships.getOneToOne('OneToOne_B{user}_User').to).to.equal('User');
        });
      });
      describe('with Authority entity as destination for a relationship', () => {
        let jdlObject;

        before(() => {
          const input = parseFromFiles([getTestFile('authority_entity_to_relationship.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it('is processed', () => {
          expect(jdlObject.relationships.getManyToOne('ManyToOne_A{authority}_Authority').to).to.equal('Authority');
          expect(jdlObject.relationships.getOneToOne('OneToOne_B{authority}_Authority').to).to.equal('Authority');
        });
      });
      describe('with an invalid option', () => {
        let input;

        before(() => {
          input = parseFromFiles([getTestFile('invalid_option.jdl')]);
        });

        it('should not fail', () => {
          parseFromConfigurationObject({
            parsedContent: input,
          });
        });
      });
      describe('with a required enum', () => {
        let jdlObject;
        let enumField;

        before(() => {
          const input = parseFromFiles([getTestFile('enum.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
          enumField = new JDLField({
            name: 'sourceType',
            type: 'MyEnum',
          });
          enumField.addValidation(
            new JDLValidation({
              name: REQUIRED,
            }),
          );
        });

        it('should add it', () => {
          expect(jdlObject.getEnum('MyEnum')).to.deep.eq(
            new JDLEnum({
              name: 'MyEnum',
              values: [{ key: 'AAA' }, { key: 'BBB' }, { key: 'CCC' }],
            }),
          );
          expect(jdlObject.entities.MyEntity.fields.sourceType).to.deep.eq(enumField);
        });
      });
      describe('when using the noFluentMethods option', () => {
        let input;
        let jdlObject;

        before(() => {
          input = parseFromFiles([getTestFile('fluent_methods.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it('should add it correctly', () => {
          expect(jdlObject.getOptions()).to.deep.eq([
            new JDLUnaryOption({
              name: unaryOptions.NO_FLUENT_METHOD,
              entityNames: new Set(['A']),
            }),
          ]);
        });
      });
      describe('when having following comments', () => {
        let jdlObject;

        before(() => {
          const input = parseFromFiles([getTestFile('following_comments.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it('should accept them', () => {
          expect(jdlObject.entities.A.fields.name.comment).to.equal('abc');
          expect(jdlObject.entities.A.fields.thing.comment).to.equal('def');
          expect(jdlObject.entities.A.fields.another.comment).to.equal(undefined);
        });
        describe('when having both forms of comments', () => {
          it('should accept the one defined first', () => {
            expect(jdlObject.entities.B.fields.name.comment).to.equal('xyz');
          });
        });
        describe('when using commas', () => {
          it('should assign the comment to the next field', () => {
            expect(jdlObject.entities.C.fields.name.comment).to.be.undefined;
            expect(jdlObject.entities.C.fields.thing.comment).to.equal('abc');
          });
        });
      });
      describe('when parsing another complex JDL file', () => {
        let jdlObject;
        let options;

        before(() => {
          const input = parseFromFiles([getTestFile('complex_jdl_2.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
          options = jdlObject.getOptions();
        });

        describe('checking the entities', () => {
          it('should parse them', () => {
            ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(entityName => {
              expect(jdlObject.entities[entityName]).to.satisfy(matchEntity);
            });
          });
        });
        describe('checking the options', () => {
          it('should parse them', () => {
            expect(options.length).to.equal(7);
            expect(options[0].name).to.equal('skipClient');
            expect(options[1].name).to.equal('skipServer');
            expect(options[2].name).to.equal(DTO);
            expect(options[2].value).to.equal(MAPSTRUCT);
            expect(options[3].name).to.equal('service');
            expect(options[3].value).to.equal(SERVICE_IMPL);
            expect(options[4].name).to.equal('service');
            expect(options[4].value).to.equal(SERVICE_CLASS);
            expect(options[5].name).to.equal('pagination');
            expect(options[5].value).to.equal(INFINITE_SCROLL);
            expect(options[6].name).to.equal('pagination');
            expect(options[6].value).to.equal(PAGINATION);
          });
        });
      });
      describe('when having two consecutive comments for fields', () => {
        let jdlObject;

        before(() => {
          const input = parseFromFiles([getTestFile('field_comments.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it('should assign them correctly', () => {
          expect(jdlObject.entities.TestEntity.fields.first.comment).to.equal('first comment');
          expect(jdlObject.entities.TestEntity.fields.second.comment).to.equal('second comment');
          expect(jdlObject.entities.TestEntity2.fields.first.comment).to.equal('first comment');
          expect(jdlObject.entities.TestEntity2.fields.second.comment).to.equal('second comment');
        });
      });
      describe('when having constants', () => {
        let jdlObject;

        before(() => {
          const input = parseFromFiles([getTestFile('constants.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it("should assign the constants' value when needed", () => {
          expect(jdlObject.entities.A.fields.name.validations).to.deep.equal({
            minlength: {
              name: 'minlength',
              value: '1',
            },
            maxlength: {
              name: 'maxlength',
              value: '42',
            },
          });
          expect(jdlObject.entities.A.fields.content.validations).to.deep.equal({
            minbytes: {
              name: 'minbytes',
              value: '20',
            },
            maxbytes: {
              name: 'maxbytes',
              value: '40',
            },
          });
          expect(jdlObject.entities.A.fields.count.validations).to.deep.equal({
            min: {
              name: 'min',
              value: '0',
            },
            max: {
              name: 'max',
              value: '41',
            },
          });
        });
      });
      describe('when having a cassandra app with paginated entities', () => {
        let input;

        before(() => {
          input = parseFromFiles([getTestFile('cassandra_jdl.jdl')]);
        });

        it('should fail', () => {
          try {
            parseFromConfigurationObject({
              parsedContent: input,
            });
          } catch (error) {
            expect((error as any).name).to.equal('IllegalOptionException');
          }
        });
      });
      describe('when parsing applications', () => {
        let parsedConfig;

        before(() => {
          const input = parseFromFiles([getTestFile('application.jdl')]);
          const jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
          parsedConfig = jdlObject.applications.toto;
        });

        it('should parse it', () => {
          jestExpect(parsedConfig).toMatchInlineSnapshot(`
JDLApplication {
  "config": JDLApplicationConfiguration {
    "namespace": undefined,
    "options": {
      "baseName": StringJDLApplicationConfigurationOption {
        "name": "baseName",
        "quoted": false,
        "value": "toto",
      },
      "enableTranslation": BooleanJDLApplicationConfigurationOption {
        "name": "enableTranslation",
        "value": false,
      },
      "languages": ListJDLApplicationConfigurationOption {
        "name": "languages",
        "quoted": false,
        "value": Set {},
      },
      "packageName": StringJDLApplicationConfigurationOption {
        "name": "packageName",
        "quoted": false,
        "value": "com.mathieu.sample",
      },
    },
  },
  "entityNames": JDLApplicationEntities {
    "entityNames": Set {},
  },
  "namespaceConfigs": [],
  "options": JDLOptions {
    "optionSize": 0,
    "options": {},
  },
}
`);
        });
      });
      describe('when parsing deployments', () => {
        let deployment;

        before(() => {
          const input = parseFromFiles([getTestFile('deployments.jdl')]);
          const jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
          deployment = jdlObject.deployments['docker-compose'];
        });

        it('should parse it', () => {
          expect(deployment.appsFolders).to.deep.equal(new Set(['tata', 'titi']));
          delete deployment.appsFolders;
          delete deployment.clusteredDbApps;

          jestExpect(deployment).toMatchInlineSnapshot(`
JDLDeployment {
  "deploymentType": "docker-compose",
  "directoryPath": "../",
  "dockerRepositoryName": "test",
  "gatewayType": "SpringCloudGateway",
  "ingressDomain": undefined,
  "ingressType": undefined,
  "istio": undefined,
  "kubernetesServiceType": undefined,
  "monitoring": "no",
  "serviceDiscoveryType": "consul",
  "storageType": undefined,
}
`);
        });
      });
      describe('when parsing filtered entities', () => {
        let jdlObject;
        let filterOption;

        before(() => {
          const input = parseFromFiles([getTestFile('filtering_without_service.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
          filterOption = jdlObject.getOptionsForName(unaryOptions.FILTER)[0];
        });

        it('should work', () => {
          expect(filterOption.entityNames.has('*')).to.be.true;
          expect(filterOption.excludedNames.has('B')).to.be.true;
        });
      });
      describe('when parsing entities with a custom client root folder', () => {
        describe('inside a microservice app', () => {
          let jdlObject;
          let clientRootFolderOption;

          before(() => {
            const input = parseFromFiles([getTestFile('simple_microservice_setup.jdl')]);
            jdlObject = parseFromConfigurationObject({
              parsedContent: input,
              applicationType: APPLICATION_TYPE_MICROSERVICE,
              applicationName: 'ms',
            });
            clientRootFolderOption = jdlObject.getOptionsForName(binaryOptions.Options.CLIENT_ROOT_FOLDER)[0];
          });

          it('should set the microservice name as clientRootFolder', () => {
            expect(clientRootFolderOption.value).to.equal('ms');
          });
        });
        describe('inside any other app', () => {
          let jdlObject;
          let clientRootFolderOption;

          before(() => {
            const input = parseFromFiles([getTestFile('client_root_folder.jdl')]);
            jdlObject = parseFromConfigurationObject({
              parsedContent: input,
              applicationType: APPLICATION_TYPE_MONOLITH,
            });
            clientRootFolderOption = jdlObject.getOptionsForName(binaryOptions.Options.CLIENT_ROOT_FOLDER)[0];
          });

          it("should set the option's value", () => {
            expect(clientRootFolderOption.entityNames.has('*')).to.be.true;
            expect(clientRootFolderOption.excludedNames.has('C')).to.be.true;
            expect(clientRootFolderOption.value).to.equal('test-root');
          });
        });
      });
      describe('when parsing a JDL inside a microservice app', () => {
        describe('without the microservice option in the JDL', () => {
          let jdlObject;
          let microserviceOption;

          before(() => {
            const input = parseFromFiles([getTestFile('no_microservice.jdl')]);
            jdlObject = parseFromConfigurationObject({
              parsedContent: input,
              applicationType: APPLICATION_TYPE_MICROSERVICE,
              applicationName: 'toto',
            });
            microserviceOption = jdlObject.getOptionsForName(binaryOptions.Options.MICROSERVICE)[0];
          });

          it('should add it to every entity', () => {
            expect(jdlObject.getOptionQuantity()).to.equal(2);
            expect(microserviceOption.entityNames).to.deep.equal(new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G']));
          });
        });
        describe('with the microservice option in the JDL', () => {
          let jdlObject;
          let microserviceOption;

          before(() => {
            const input = parseFromFiles([getTestFile('simple_microservice_setup.jdl')]);
            jdlObject = parseFromConfigurationObject({
              parsedContent: input,
              applicationType: APPLICATION_TYPE_MICROSERVICE,
              applicationName: 'toto',
            });
            microserviceOption = jdlObject.getOptionsForName(binaryOptions.Options.MICROSERVICE)[0];
          });

          it('does not automatically setup the microservice option', () => {
            expect(jdlObject.getOptionQuantity()).to.equal(2);
            expect(microserviceOption.entityNames).to.deep.equal(new Set(['A']));
          });
        });
      });
      describe('when parsing a JDL microservice application with entities', () => {
        let entityNames;

        before(() => {
          const input = parseFromFiles([getTestFile('application_with_entities.jdl')]);
          const jdlObject = parseFromConfigurationObject({
            parsedContent: input,
          });
          entityNames = jdlObject.applications.MyApp.getEntityNames();
        });

        it('should add the application entities in the application object', () => {
          jestExpect(entityNames).toMatchInlineSnapshot(`
[
  "BankAccount",
]
`);
        });
      });
      describe('when parsing a relationship with no injected field', () => {
        let jdlObject;
        let relationshipOneToOne;
        let relationshipOneToMany;
        let relationshipManyToMany;

        before(() => {
          const input = parseFromFiles([getTestFile('no_injected_field.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
            applicationType: APPLICATION_TYPE_MONOLITH,
          });
          relationshipOneToOne = jdlObject.relationships.getOneToOne('OneToOne_A{b}_B{a}');
          relationshipOneToMany = jdlObject.relationships.getOneToMany('OneToMany_A{b}_B{a}');
          relationshipManyToMany = jdlObject.relationships.getManyToMany('ManyToMany_A{b}_B{a}');
        });

        it('should add a default one', () => {
          expect(relationshipOneToOne.injectedFieldInTo).to.equal('a');
          expect(relationshipOneToOne.injectedFieldInFrom).to.equal('b');
          expect(relationshipOneToMany.injectedFieldInTo).to.equal('a');
          expect(relationshipOneToMany.injectedFieldInFrom).to.equal('b');
          expect(relationshipManyToMany.injectedFieldInTo).to.equal('a');
          expect(relationshipManyToMany.injectedFieldInFrom).to.equal('b');
        });
      });
      describe('when parsing entities with annotations', () => {
        describe('that are not capitalized', () => {
          let entityA;
          let entityB;
          let entityC;
          let fieldAnnotation;
          let relationshipAnnotationOnSource;
          let relationshipAnnotationOnDestination;

          before(() => {
            const input = parseFromFiles([getTestFile('annotations.jdl')]);
            const jdlObject = parseFromConfigurationObject({
              parsedContent: input,
              applicationType: APPLICATION_TYPE_MONOLITH,
            });
            entityA = jdlObject.entities.A;
            entityB = jdlObject.entities.B;
            entityC = jdlObject.entities.C;
            fieldAnnotation = jdlObject.entities.A.fields.name.options.id;
            relationshipAnnotationOnSource = jdlObject.relationships.getOneToMany('OneToMany_A{b}_B{a}')!.options.source;
            relationshipAnnotationOnDestination = jdlObject.relationships.getOneToMany('OneToMany_A{b}_B{a}')!.options.destination;
          });

          it('should set the annotations as options', () => {
            jestExpect(entityA.annotations).toMatchInlineSnapshot(`
{
  "dto": "mapstruct",
  "myCustomBinaryOption": "customValue",
  "myCustomUnaryOption": true,
  "service": "serviceClass",
  "skipClient": true,
}
`);
            jestExpect(entityB.annotations).toMatchInlineSnapshot(`
{
  "dto": "mapstruct",
  "myCustomUnaryOption": true,
  "pagination": "pagination",
  "service": "serviceClass",
}
`);
            jestExpect(entityC.annotations).toMatchInlineSnapshot(`
{
  "filter": true,
  "myCustomBinaryOption": "customValue2",
  "pagination": "pagination",
  "skipClient": true,
}
`);
            expect(fieldAnnotation).to.deep.equal(true);
            jestExpect(relationshipAnnotationOnSource).toMatchInlineSnapshot(`
{
  "annotationOnSource": "toto",
}
`);
            jestExpect(relationshipAnnotationOnDestination).toMatchInlineSnapshot(`
{
  "annotationOnDestination": true,
}
`);
          });
        });
        describe('that are capitalized', () => {
          let entityA;
          let entityB;
          let entityC;
          let fieldAnnotation;
          let relationshipAnnotationOnSource;
          let relationshipAnnotationOnDestination;

          before(() => {
            const input = parseFromFiles([getTestFile('capitalized_annotations.jdl')]);
            const jdlObject = parseFromConfigurationObject({
              parsedContent: input,
              applicationType: APPLICATION_TYPE_MONOLITH,
            });
            entityA = jdlObject.entities.A;
            entityB = jdlObject.entities.B;
            entityC = jdlObject.entities.C;
            fieldAnnotation = jdlObject.entities.A.fields.name.options.id;
            relationshipAnnotationOnSource = jdlObject.relationships.getOneToMany('OneToMany_A{b}_B{a}')!.options.source;
            relationshipAnnotationOnDestination = jdlObject.relationships.getOneToMany('OneToMany_A{b}_B{a}')!.options.destination;
          });

          it('should set the annotations as options with lower-case letters first', () => {
            jestExpect(entityA.annotations).toMatchInlineSnapshot(`
{
  "dto": "mapstruct",
  "myCustomBinaryOption": "customValue",
  "myCustomUnaryOption": true,
  "service": "serviceClass",
  "skipClient": true,
}
`);
            jestExpect(entityB.annotations).toMatchInlineSnapshot(`
{
  "dto": "mapstruct",
  "myCustomUnaryOption": true,
  "paginate": "pagination",
  "service": "serviceClass",
}
`);
            jestExpect(entityC.annotations).toMatchInlineSnapshot(`
{
  "filter": true,
  "myCustomBinaryOption": "customValue2",
  "paginate": "pagination",
  "skipClient": true,
}
`);
            expect(fieldAnnotation).to.deep.equal(true);
            jestExpect(relationshipAnnotationOnSource).toMatchInlineSnapshot(`
{
  "annotationOnSource": true,
}
`);
            jestExpect(relationshipAnnotationOnDestination).toMatchInlineSnapshot(`
{
  "annotationOnDestination": true,
}
`);
          });
        });
      });
      describe('when parsing a mix between annotations and regular options', () => {
        let entityA;
        let entityB;
        let entityC;

        before(() => {
          const input = parseFromFiles([getTestFile('annotations_and_options.jdl')]);
          const jdlObject = parseFromConfigurationObject({
            parsedContent: input,
            applicationType: APPLICATION_TYPE_MONOLITH,
          });
          entityA = jdlObject.entities.A;
          entityB = jdlObject.entities.B;
          entityC = jdlObject.entities.C;
        });

        describe('correctly should set the options', () => {
          it('should set the annotations as options with lower-case letters first', () => {
            jestExpect(entityA.annotations).toMatchInlineSnapshot(`
{
  "dto": "mapstruct",
  "service": "serviceClass",
  "skipClient": true,
}
`);
            jestExpect(entityB.annotations).toMatchInlineSnapshot(`
{
  "dto": "mapstruct",
  "paginate": "pagination",
  "service": "serviceClass",
}
`);
            jestExpect(entityC.annotations).toMatchInlineSnapshot(`
{
  "embedded": true,
  "filter": true,
  "paginate": "pagination",
  "readOnly": true,
  "skipClient": true,
}
`);
          });
        });
      });
      describe('when having a pattern validation with a quote in it', () => {
        let jdlObject;

        before(() => {
          const input = parseFromFiles([getTestFile('pattern_validation_with_quote.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
            applicationType: APPLICATION_TYPE_MONOLITH,
          });
        });

        it('formats it', () => {
          expect(jdlObject.getEntity('Alumni').fields.firstName.validations.pattern.value.includes("\\'")).be.true;
        });
      });
      describe('when parsing a JDL with the unique constraint', () => {
        let jdlObject;

        before(() => {
          const input = parseFromFiles([getTestFile('unique.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
            applicationType: APPLICATION_TYPE_MONOLITH,
          });
        });

        it('should accept it', () => {
          expect(jdlObject.entities.A.fields.myString.validations.unique).not.to.be.undefined;
          expect(jdlObject.entities.A.fields.myInteger.validations.unique).not.to.be.undefined;
        });
      });
      describe('when parsing a JDL relationship with built in entity enabled', () => {
        let jdlObject;

        before(() => {
          const input = parseFromFiles([getTestFile('relationship_built_in_entity.jdl')]);
          jdlObject = parseFromConfigurationObject({
            parsedContent: input,
            applicationType: APPLICATION_TYPE_MONOLITH,
          });
        });

        it('should set it', () => {
          expect(jdlObject.relationships.getOneToOne('OneToOne_A{b}_B').options.global).to.deep.equal({
            builtInEntity: true,
          });
        });
      });
      describe('when parsing entity options in applications', () => {
        describe('if the entity list does not contain some entities mentioned in options', () => {
          let parsedContent;

          before(() => {
            parsedContent = parseFromContent(`application {
  config {
    baseName testApp1
  }
  entities A
  readOnly B
}

entity A
entity B
`);
          });

          it('should fail', () => {
            expect(() =>
              parseFromConfigurationObject({
                parsedContent,
              }),
            ).to.throw(/^The entity B in the readOnly option isn't declared in testApp1's entity list.$/);
          });
        });
        describe('if the entity list contains all the entities mentioned in options', () => {
          let optionsForFirstApplication;
          let optionsForSecondApplication;

          before(() => {
            const input = parseFromContent(`application {
  config {
    baseName testApp1
  }
  entities A, B, C
  readOnly A
  paginate * with pagination except C
  search C with couchbase
}

application {
  config {
    baseName testApp2
  }
  entities A, D
  readOnly D
}

entity A
entity B
entity C
entity D

skipClient D
`);
            const jdlObject = parseFromConfigurationObject({
              parsedContent: input,
            });
            optionsForFirstApplication = jdlObject.applications.testApp1.options;
            optionsForSecondApplication = jdlObject.applications.testApp2.options;
          });

          it('should parse them', () => {
            expect(optionsForFirstApplication.size()).to.equal(3);
            expect(optionsForSecondApplication.size()).to.equal(1);
          });
        });
      });
    });
  });
});
