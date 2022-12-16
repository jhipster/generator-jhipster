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

/* eslint-disable no-new, no-unused-expressions */
import { jestExpect } from 'mocha-expect-snapshot';
import { expect } from 'chai';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import matchEntity from '../../matchers/entity-matcher.js';
import * as JDLReader from '../../../../jdl/readers/jdl-reader.js';
import ParsedJDLToJDLObjectConverter from '../../../../jdl/converters/parsed-jdl-to-jdl-object/parsed-jdl-to-jdl-object-converter.js';
import JDLEntity from '../../../../jdl/models/jdl-entity.js';
import JDLEnum from '../../../../jdl/models/jdl-enum.js';
import JDLField from '../../../../jdl/models/jdl-field.js';
import JDLValidation from '../../../../jdl/models/jdl-validation.js';
import JDLUnaryOption from '../../../../jdl/models/jdl-unary-option.js';
import JDLBinaryOption from '../../../../jdl/models/jdl-binary-option.js';
import ApplicationTypes from '../../../../jdl/jhipster/application-types.js';
import FieldTypes from '../../../../jdl/jhipster/field-types.js';

import Validations from '../../../../jdl/jhipster/validations.js';
import UnaryOptions from '../../../../jdl/jhipster/unary-options.js';
import ApplicationOptions from '../../../../jdl/jhipster/application-options.js';

const { OptionNames } = ApplicationOptions;

import EntityOptions from '../../../../jdl/jhipster/entity-options.js';

import BinaryOptions from '../../../../jdl/jhipster/binary-options.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { MapperTypes, ServiceTypes, PaginationTypes } = EntityOptions;

const BinaryOptionValues = BinaryOptions.Values;
const { DTO } = BinaryOptions.Options;
const { SKIP_CLIENT, SKIP_SERVER } = OptionNames;
const { MAPSTRUCT } = MapperTypes;
const { SERVICE_CLASS, SERVICE_IMPL } = ServiceTypes;
const { INFINITE_SCROLL, PAGINATION } = PaginationTypes;

describe('ParsedJDLToJDLObjectConverter', () => {
  describe('parse', () => {
    context('when passing invalid args', () => {
      context('because there is no parsedContent', () => {
        it('should fail', () => {
          expect(() => {
            ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({});
          }).to.throw(/^The parsed JDL content must be passed\.$/);
        });
      });
    });
    context('when passing valid args', () => {
      context('with no error', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'complex_jdl.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it('should build a JDLObject', () => {
          expect(jdlObject).not.to.be.null;
          expect(jdlObject.entities.Department).to.deep.equal(
            new JDLEntity({
              name: 'Department',
              tableName: 'Department',
              fields: {
                guid: new JDLField({
                  name: 'guid',
                  type: FieldTypes.CommonDBTypes.UUID,
                  validations: {
                    required: new JDLValidation({ name: Validations.REQUIRED }),
                  },
                }),
                name: new JDLField({
                  name: 'name',
                  type: FieldTypes.CommonDBTypes.STRING,
                  validations: {
                    required: new JDLValidation({ name: Validations.REQUIRED }),
                    unique: new JDLValidation({ name: Validations.UNIQUE }),
                  },
                }),
                description: new JDLField({
                  name: 'description',
                  type: FieldTypes.CommonDBTypes.TEXT_BLOB,
                }),
                advertisement: new JDLField({
                  name: 'advertisement',
                  type: FieldTypes.CommonDBTypes.BLOB,
                }),
                logo: new JDLField({
                  name: 'logo',
                  type: FieldTypes.CommonDBTypes.IMAGE_BLOB,
                }),
              },
            })
          );
          expect(jdlObject.entities.JobHistory).to.deep.eq(
            new JDLEntity({
              name: 'JobHistory',
              tableName: 'JobHistory',
              fields: {
                startDate: new JDLField({
                  name: 'startDate',
                  type: FieldTypes.CommonDBTypes.ZONED_DATE_TIME,
                }),
                endDate: new JDLField({
                  name: 'endDate',
                  type: FieldTypes.CommonDBTypes.ZONED_DATE_TIME,
                }),
                language: new JDLField({ name: 'language', type: 'Language' }),
              },
              comment: 'JobHistory comment.',
            })
          );
          expect(jdlObject.getEnum('JobType')).to.deep.equal(
            new JDLEnum({
              name: 'JobType',
              values: [{ key: 'TYPE1' }, { key: 'TYPE2' }],
            })
          );
          expect(jdlObject.entities.Job).to.deep.eq(
            new JDLEntity({
              name: 'Job',
              tableName: 'Job',
              fields: {
                jobTitle: new JDLField({
                  name: 'jobTitle',
                  type: FieldTypes.CommonDBTypes.STRING,
                  validations: {
                    minlength: new JDLValidation({
                      name: Validations.MINLENGTH,
                      value: '5',
                    }),
                    maxlength: new JDLValidation({
                      name: Validations.MAXLENGTH,
                      value: '25',
                    }),
                  },
                }),
                jobType: new JDLField({ name: 'jobType', type: 'JobType' }),
                minSalary: new JDLField({
                  name: 'minSalary',
                  type: FieldTypes.CommonDBTypes.LONG,
                }),
                maxSalary: new JDLField({
                  name: 'maxSalary',
                  type: FieldTypes.CommonDBTypes.LONG,
                }),
              },
            })
          );
          expect(jdlObject.getOptions()).to.deep.eq([
            new JDLUnaryOption({
              name: UnaryOptions.SKIP_SERVER,
              entityNames: ['Country'],
            }),
            new JDLBinaryOption({
              name: BinaryOptions.Options.DTO,
              entityNames: ['Employee'],
              value: BinaryOptionValues.dto.MAPSTRUCT,
            }),
            new JDLBinaryOption({
              name: BinaryOptions.Options.SERVICE,
              entityNames: ['Employee'],
              value: BinaryOptionValues.service.SERVICE_CLASS,
            }),
            new JDLBinaryOption({
              name: BinaryOptions.Options.PAGINATION,
              entityNames: ['JobHistory', 'Employee'],
              value: BinaryOptionValues.pagination['INFINITE-SCROLL'],
            }),
            new JDLBinaryOption({
              name: BinaryOptions.Options.PAGINATION,
              entityNames: ['Job'],
              value: BinaryOptionValues.pagination.PAGINATION,
            }),
            new JDLBinaryOption({
              name: BinaryOptions.Options.MICROSERVICE,
              entityNames: ['*'],
              value: 'mymicroservice',
            }),
            new JDLBinaryOption({
              name: BinaryOptions.Options.SEARCH,
              entityNames: ['Employee'],
              value: BinaryOptionValues.search.ELASTICSEARCH,
            }),
          ]);
        });
      });
      context('with an application type', () => {
        let input;

        before(() => {
          input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'invalid_field_type.jdl')]);
        });

        it('should not check for field types', () => {
          ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
            applicationType: ApplicationTypes.GATEWAY,
          });
        });
      });
      context('with a required relationship', () => {
        let jdlObject;
        let relationship;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'required_relationships.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
          });
          relationship = jdlObject.relationships.getOneToOne('OneToOne_A{b}_B{a}');
        });

        it('should add it', () => {
          expect(relationship.isInjectedFieldInFromRequired).to.be.true;
          expect(relationship.isInjectedFieldInToRequired).to.be.false;
        });
      });
      context("with a field name 'id'", () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'id_field.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it('should add it', () => {
          expect(jdlObject.entities.A).to.deep.eq(
            new JDLEntity({
              name: 'A',
              tableName: 'A',
              fields: {
                email: new JDLField({ name: 'email', type: FieldTypes.CommonDBTypes.STRING }),
                id: new JDLField({
                  name: 'id',
                  type: FieldTypes.CommonDBTypes.LONG,
                }),
              },
            })
          );
        });
      });
      context('with User entity as destination for a relationship', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'user_entity_to_relationship.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it('should be processed', () => {
          expect(jdlObject.relationships.getManyToOne('ManyToOne_A{user}_User').to).to.equal('User');
          expect(jdlObject.relationships.getOneToOne('OneToOne_B{user}_User').to).to.equal('User');
        });
      });
      context('with Authority entity as destination for a relationship', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'authority_entity_to_relationship.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it('is processed', () => {
          expect(jdlObject.relationships.getManyToOne('ManyToOne_A{authority}_Authority').to).to.equal('Authority');
          expect(jdlObject.relationships.getOneToOne('OneToOne_B{authority}_Authority').to).to.equal('Authority');
        });
      });
      context('with an invalid option', () => {
        let input;

        before(() => {
          input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'invalid_option.jdl')]);
        });

        it('should not fail', () => {
          ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
          });
        });
      });
      context('with a required enum', () => {
        let jdlObject;
        let enumField;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'enum.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
          });
          enumField = new JDLField({
            name: 'sourceType',
            type: 'MyEnum',
          });
          enumField.addValidation(
            new JDLValidation({
              name: Validations.REQUIRED,
            })
          );
        });

        it('should add it', () => {
          expect(jdlObject.getEnum('MyEnum')).to.deep.eq(
            new JDLEnum({
              name: 'MyEnum',
              values: [{ key: 'AAA' }, { key: 'BBB' }, { key: 'CCC' }],
            })
          );
          expect(jdlObject.entities.MyEntity.fields.sourceType).to.deep.eq(enumField);
        });
      });
      context('when using the noFluentMethods option', () => {
        let input;
        let jdlObject;

        before(() => {
          input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'fluent_methods.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it('should add it correctly', () => {
          expect(jdlObject.getOptions()).to.deep.eq([
            new JDLUnaryOption({
              name: UnaryOptions.NO_FLUENT_METHOD,
              entityNames: ['A'],
            }),
          ]);
        });
      });
      context('when having following comments', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'following_comments.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
          });
        });

        it('should accept them', () => {
          expect(jdlObject.entities.A.fields.name.comment).to.equal('abc');
          expect(jdlObject.entities.A.fields.thing.comment).to.equal('def');
          expect(jdlObject.entities.A.fields.another.comment).to.equal(undefined);
        });
        context('when having both forms of comments', () => {
          it('should accept the one defined first', () => {
            expect(jdlObject.entities.B.fields.name.comment).to.equal('xyz');
          });
        });
        context('when using commas', () => {
          it('should assign the comment to the next field', () => {
            expect(jdlObject.entities.C.fields.name.comment).to.be.undefined;
            expect(jdlObject.entities.C.fields.thing.comment).to.equal('abc');
          });
        });
      });
      context('when parsing another complex JDL file', () => {
        let jdlObject;
        let options;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'complex_jdl_2.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
          });
          options = jdlObject.getOptions();
        });

        context('checking the entities', () => {
          it('should parse them', () => {
            ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(entityName => {
              expect(jdlObject.entities[entityName]).to.satisfy(matchEntity);
            });
          });
        });
        context('checking the options', () => {
          it('should parse them', () => {
            expect(options.length).to.equal(7);
            expect(options[0].name).to.equal(SKIP_CLIENT);
            expect(options[1].name).to.equal(SKIP_SERVER);
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
      context('when having two consecutive comments for fields', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'field_comments.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
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
      context('when having constants', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'constants.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
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
      context('when having a cassandra app with paginated entities', () => {
        let input;

        before(() => {
          input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'cassandra_jdl.jdl')]);
        });

        it('should fail', () => {
          try {
            ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
              parsedContent: input,
            });
          } catch (error) {
            expect((error as any).name).to.equal('IllegalOptionException');
          }
        });
      });
      context('when parsing applications', () => {
        let parsedConfig;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'application.jdl')]);
          const jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
          });
          parsedConfig = jdlObject.applications.toto;
        });

        it('should parse it', () => {
          jestExpect(parsedConfig).toMatchInlineSnapshot(`
JDLApplication {
  "config": JDLApplicationConfiguration {
    "options": Object {
      "applicationType": StringJDLApplicationConfigurationOption {
        "name": "applicationType",
        "quoted": false,
        "value": "monolith",
      },
      "authenticationType": StringJDLApplicationConfigurationOption {
        "name": "authenticationType",
        "quoted": false,
        "value": "jwt",
      },
      "baseName": StringJDLApplicationConfigurationOption {
        "name": "baseName",
        "quoted": false,
        "value": "toto",
      },
      "buildTool": StringJDLApplicationConfigurationOption {
        "name": "buildTool",
        "quoted": false,
        "value": "maven",
      },
      "cacheProvider": StringJDLApplicationConfigurationOption {
        "name": "cacheProvider",
        "quoted": false,
        "value": "ehcache",
      },
      "clientFramework": StringJDLApplicationConfigurationOption {
        "name": "clientFramework",
        "quoted": false,
        "value": "angular",
      },
      "clientPackageManager": StringJDLApplicationConfigurationOption {
        "name": "clientPackageManager",
        "quoted": false,
        "value": "npm",
      },
      "clientTheme": StringJDLApplicationConfigurationOption {
        "name": "clientTheme",
        "quoted": false,
        "value": "none",
      },
      "clientThemeVariant": StringJDLApplicationConfigurationOption {
        "name": "clientThemeVariant",
        "quoted": false,
        "value": "",
      },
      "databaseType": StringJDLApplicationConfigurationOption {
        "name": "databaseType",
        "quoted": false,
        "value": "sql",
      },
      "devDatabaseType": StringJDLApplicationConfigurationOption {
        "name": "devDatabaseType",
        "quoted": false,
        "value": "h2Disk",
      },
      "dtoSuffix": StringJDLApplicationConfigurationOption {
        "name": "dtoSuffix",
        "quoted": false,
        "value": "DTO",
      },
      "enableGradleEnterprise": BooleanJDLApplicationConfigurationOption {
        "name": "enableGradleEnterprise",
        "value": false,
      },
      "enableHibernateCache": BooleanJDLApplicationConfigurationOption {
        "name": "enableHibernateCache",
        "value": true,
      },
      "enableSwaggerCodegen": BooleanJDLApplicationConfigurationOption {
        "name": "enableSwaggerCodegen",
        "value": false,
      },
      "enableTranslation": BooleanJDLApplicationConfigurationOption {
        "name": "enableTranslation",
        "value": false,
      },
      "entitySuffix": StringJDLApplicationConfigurationOption {
        "name": "entitySuffix",
        "quoted": false,
        "value": "",
      },
      "gradleEnterpriseHost": StringJDLApplicationConfigurationOption {
        "name": "gradleEnterpriseHost",
        "quoted": true,
        "value": "",
      },
      "jhiPrefix": StringJDLApplicationConfigurationOption {
        "name": "jhiPrefix",
        "quoted": false,
        "value": "jhi",
      },
      "languages": ListJDLApplicationConfigurationOption {
        "name": "languages",
        "value": Set {},
      },
      "messageBroker": StringJDLApplicationConfigurationOption {
        "name": "messageBroker",
        "quoted": false,
        "value": false,
      },
      "packageFolder": StringJDLApplicationConfigurationOption {
        "name": "packageFolder",
        "quoted": false,
        "value": "com/mathieu/sample",
      },
      "packageName": StringJDLApplicationConfigurationOption {
        "name": "packageName",
        "quoted": false,
        "value": "com.mathieu.sample",
      },
      "prodDatabaseType": StringJDLApplicationConfigurationOption {
        "name": "prodDatabaseType",
        "quoted": false,
        "value": "postgresql",
      },
      "reactive": BooleanJDLApplicationConfigurationOption {
        "name": "reactive",
        "value": false,
      },
      "searchEngine": StringJDLApplicationConfigurationOption {
        "name": "searchEngine",
        "quoted": false,
        "value": false,
      },
      "serverPort": IntegerJDLApplicationConfigurationOption {
        "name": "serverPort",
        "value": "8080",
      },
      "serviceDiscoveryType": StringJDLApplicationConfigurationOption {
        "name": "serviceDiscoveryType",
        "quoted": false,
        "value": false,
      },
      "skipUserManagement": BooleanJDLApplicationConfigurationOption {
        "name": "skipUserManagement",
        "value": false,
      },
      "testFrameworks": ListJDLApplicationConfigurationOption {
        "name": "testFrameworks",
        "value": Set {},
      },
      "websocket": StringJDLApplicationConfigurationOption {
        "name": "websocket",
        "quoted": false,
        "value": false,
      },
      "withAdminUi": BooleanJDLApplicationConfigurationOption {
        "name": "withAdminUi",
        "value": true,
      },
    },
  },
  "entityNames": JDLApplicationEntities {
    "entityNames": Set {},
  },
  "options": JDLOptions {
    "optionSize": 0,
    "options": Object {},
  },
}
`);
        });
      });
      context('when parsing deployments', () => {
        let deployment;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'deployments.jdl')]);
          const jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
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
  "monitoring": "no",
  "serviceDiscoveryType": "eureka",
}
`);
        });
      });
      context('when parsing filtered entities', () => {
        let jdlObject;
        let filterOption;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'filtering_without_service.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
          });
          filterOption = jdlObject.getOptionsForName(UnaryOptions.FILTER)[0];
        });

        it('should work', () => {
          expect(filterOption.entityNames.has('*')).to.be.true;
          expect(filterOption.excludedNames.has('B')).to.be.true;
        });
      });
      context('when parsing entities with a custom client root folder', () => {
        context('inside a microservice app', () => {
          let jdlObject;
          let clientRootFolderOption;

          before(() => {
            const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'simple_microservice_setup.jdl')]);
            jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
              parsedContent: input,
              applicationType: ApplicationTypes.MICROSERVICE,
              applicationName: 'ms',
            });
            clientRootFolderOption = jdlObject.getOptionsForName(BinaryOptions.Options.CLIENT_ROOT_FOLDER)[0];
          });

          it('should set the microservice name as clientRootFolder', () => {
            expect(clientRootFolderOption.value).to.equal('ms');
          });
        });
        context('inside any other app', () => {
          let jdlObject;
          let clientRootFolderOption;

          before(() => {
            const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'client_root_folder.jdl')]);
            jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
              parsedContent: input,
              applicationType: ApplicationTypes.MONOLITH,
            });
            clientRootFolderOption = jdlObject.getOptionsForName(BinaryOptions.Options.CLIENT_ROOT_FOLDER)[0];
          });

          it("should set the option's value", () => {
            expect(clientRootFolderOption.entityNames.has('*')).to.be.true;
            expect(clientRootFolderOption.excludedNames.has('C')).to.be.true;
            expect(clientRootFolderOption.value).to.equal('test-root');
          });
        });
      });
      context('when parsing a JDL inside a microservice app', () => {
        context('without the microservice option in the JDL', () => {
          let jdlObject;
          let microserviceOption;

          before(() => {
            const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'no_microservice.jdl')]);
            jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
              parsedContent: input,
              applicationType: ApplicationTypes.MICROSERVICE,
              applicationName: 'toto',
            });
            microserviceOption = jdlObject.getOptionsForName(BinaryOptions.Options.MICROSERVICE)[0];
          });

          it('should add it to every entity', () => {
            expect(jdlObject.getOptionQuantity()).to.equal(2);
            expect(microserviceOption.entityNames).to.deep.equal(new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G']));
          });
        });
        context('with the microservice option in the JDL', () => {
          let jdlObject;
          let microserviceOption;

          before(() => {
            const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'simple_microservice_setup.jdl')]);
            jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
              parsedContent: input,
              applicationType: ApplicationTypes.MICROSERVICE,
              applicationName: 'toto',
            });
            microserviceOption = jdlObject.getOptionsForName(BinaryOptions.Options.MICROSERVICE)[0];
          });

          it('does not automatically setup the microservice option', () => {
            expect(jdlObject.getOptionQuantity()).to.equal(2);
            expect(microserviceOption.entityNames).to.deep.equal(new Set(['A']));
          });
        });
      });
      context('when parsing a JDL microservice application with entities', () => {
        let entityNames;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'application_with_entities.jdl')]);
          const jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
          });
          entityNames = jdlObject.applications.MyApp.getEntityNames();
        });

        it('should add the application entities in the application object', () => {
          jestExpect(entityNames).toMatchInlineSnapshot(`
Array [
  "BankAccount",
]
`);
        });
      });
      context('when parsing a relationship with no injected field', () => {
        let jdlObject;
        let relationshipOneToOne;
        let relationshipOneToMany;
        let relationshipManyToMany;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'no_injected_field.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
            applicationType: ApplicationTypes.MONOLITH,
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
      context('when parsing entities with annotations', () => {
        context('that are not capitalized', () => {
          let dtoOption;
          let filterOption;
          let paginationOption;
          let serviceOption;
          let skipClientOption;
          let customUnaryOption;
          let customBinaryOption;
          let customBinaryOption2;
          let fieldAnnotation;
          let relationshipAnnotationOnSource;
          let relationshipAnnotationOnDestination;

          before(() => {
            const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'annotations.jdl')]);
            const jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
              parsedContent: input,
              applicationType: ApplicationTypes.MONOLITH,
            });
            dtoOption = jdlObject.getOptionsForName(BinaryOptions.Options.DTO)[0];
            filterOption = jdlObject.getOptionsForName(UnaryOptions.FILTER)[0];
            paginationOption = jdlObject.getOptionsForName(BinaryOptions.Options.PAGINATION)[0];
            serviceOption = jdlObject.getOptionsForName(BinaryOptions.Options.SERVICE)[0];
            skipClientOption = jdlObject.getOptionsForName(UnaryOptions.SKIP_CLIENT)[0];
            customUnaryOption = jdlObject.getOptionsForName('myCustomUnaryOption')[0];
            customBinaryOption = jdlObject.getOptionsForName('myCustomBinaryOption')[0];
            customBinaryOption2 = jdlObject.getOptionsForName('myCustomBinaryOption')[1];
            fieldAnnotation = jdlObject.entities.A.fields.name.options.id;
            relationshipAnnotationOnSource = jdlObject.relationships.getOneToMany('OneToMany_A{b}_B{a}').options.source;
            relationshipAnnotationOnDestination = jdlObject.relationships.getOneToMany('OneToMany_A{b}_B{a}').options.destination;
          });

          it('should set the annotations as options', () => {
            expect(dtoOption.entityNames).to.deep.equal(new Set(['A', 'B']));
            expect(filterOption.entityNames).to.deep.equal(new Set(['C']));
            expect(paginationOption.entityNames).to.deep.equal(new Set(['B', 'C']));
            expect(serviceOption.entityNames).to.deep.equal(new Set(['A', 'B']));
            expect(skipClientOption.entityNames).to.deep.equal(new Set(['A', 'C']));
            expect(customUnaryOption.entityNames).to.deep.equal(new Set(['A', 'B']));
            expect(customBinaryOption.entityNames).to.deep.equal(new Set(['A']));
            expect(customBinaryOption2.entityNames).to.deep.equal(new Set(['C']));
            expect(customBinaryOption.value).to.deep.equal('customValue');
            expect(customBinaryOption2.value).to.deep.equal('customValue2');
            expect(fieldAnnotation).to.deep.equal(true);
            jestExpect(relationshipAnnotationOnSource).toMatchInlineSnapshot(`
Object {
  "annotationOnSource": "toto",
}
`);
            jestExpect(relationshipAnnotationOnDestination).toMatchInlineSnapshot(`
Object {
  "annotationOnDestination": true,
}
`);
          });
        });
        context('that are capitalized', () => {
          let dtoOption;
          let filterOption;
          let paginationOption;
          let serviceOption;
          let skipClientOption;
          let customUnaryOption;
          let customBinaryOption;
          let customBinaryOption2;
          let fieldAnnotation;
          let relationshipAnnotationOnSource;
          let relationshipAnnotationOnDestination;

          before(() => {
            const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'capitalized_annotations.jdl')]);
            const jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
              parsedContent: input,
              applicationType: ApplicationTypes.MONOLITH,
            });
            dtoOption = jdlObject.getOptionsForName(BinaryOptions.Options.DTO)[0];
            filterOption = jdlObject.getOptionsForName(UnaryOptions.FILTER)[0];
            paginationOption = jdlObject.getOptionsForName(BinaryOptions.Options.PAGINATION)[0];
            serviceOption = jdlObject.getOptionsForName(BinaryOptions.Options.SERVICE)[0];
            skipClientOption = jdlObject.getOptionsForName(UnaryOptions.SKIP_CLIENT)[0];
            customUnaryOption = jdlObject.getOptionsForName('myCustomUnaryOption')[0];
            customBinaryOption = jdlObject.getOptionsForName('myCustomBinaryOption')[0];
            customBinaryOption2 = jdlObject.getOptionsForName('myCustomBinaryOption')[1];
            fieldAnnotation = jdlObject.entities.A.fields.name.options.id;
            relationshipAnnotationOnSource = jdlObject.relationships.getOneToMany('OneToMany_A{b}_B{a}').options.source;
            relationshipAnnotationOnDestination = jdlObject.relationships.getOneToMany('OneToMany_A{b}_B{a}').options.destination;
          });

          it('should set the annotations as options with lower-case letters first', () => {
            expect(dtoOption.entityNames).to.deep.equal(new Set(['A', 'B']));
            expect(filterOption.entityNames).to.deep.equal(new Set(['C']));
            expect(paginationOption.entityNames).to.deep.equal(new Set(['B', 'C']));
            expect(serviceOption.entityNames).to.deep.equal(new Set(['A', 'B']));
            expect(skipClientOption.entityNames).to.deep.equal(new Set(['A', 'C']));
            expect(customUnaryOption.entityNames).to.deep.equal(new Set(['A', 'B']));
            expect(customBinaryOption.entityNames).to.deep.equal(new Set(['A']));
            expect(customBinaryOption2.entityNames).to.deep.equal(new Set(['C']));
            expect(customBinaryOption.value).to.deep.equal('customValue');
            expect(customBinaryOption2.value).to.deep.equal('customValue2');
            expect(fieldAnnotation).to.deep.equal(true);
            jestExpect(relationshipAnnotationOnSource).toMatchInlineSnapshot(`
Object {
  "annotationOnSource": true,
}
`);
            jestExpect(relationshipAnnotationOnDestination).toMatchInlineSnapshot(`
Object {
  "annotationOnDestination": true,
}
`);
          });
        });
      });
      context('when parsing a mix between annotations and regular options', () => {
        let dtoOptions;
        let filterOptions;
        let paginationOptions;
        let serviceOptions;
        let skipClientOptions;
        let skipServerOptions;
        let readOnlyOptions;
        let embeddedOptions;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'annotations_and_options.jdl')]);
          const jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
            applicationType: ApplicationTypes.MONOLITH,
          });
          dtoOptions = jdlObject.getOptionsForName(BinaryOptions.Options.DTO);
          filterOptions = jdlObject.getOptionsForName(UnaryOptions.FILTER);
          paginationOptions = jdlObject.getOptionsForName(BinaryOptions.Options.PAGINATION);
          serviceOptions = jdlObject.getOptionsForName(BinaryOptions.Options.SERVICE);
          skipClientOptions = jdlObject.getOptionsForName(UnaryOptions.SKIP_CLIENT);
          skipServerOptions = jdlObject.getOptionsForName(UnaryOptions.SKIP_SERVER);
          readOnlyOptions = jdlObject.getOptionsForName(UnaryOptions.READ_ONLY);
          embeddedOptions = jdlObject.getOptionsForName(UnaryOptions.EMBEDDED);
        });

        it('correctly should set the options', () => {
          expect(dtoOptions).to.have.length(1);
          expect(dtoOptions[0].entityNames).to.deep.equal(new Set(['A', 'B']));

          expect(filterOptions).to.have.length(1);
          expect(filterOptions[0].entityNames).to.deep.equal(new Set(['C']));

          expect(paginationOptions).to.have.length(1);
          expect(paginationOptions[0].entityNames).to.deep.equal(new Set(['B', 'C']));

          expect(serviceOptions).to.have.length(2);
          expect(serviceOptions[0].entityNames).to.deep.equal(new Set(['A', 'B']));
          expect(serviceOptions[1].entityNames).to.deep.equal(new Set(['A']));

          expect(skipClientOptions).to.have.length(1);
          expect(skipClientOptions[0].entityNames).to.deep.equal(new Set(['A', 'C']));

          expect(skipServerOptions).to.have.length(1);
          expect(skipServerOptions[0].entityNames).to.deep.equal(new Set(['A']));

          expect(readOnlyOptions).to.have.length(1);
          expect(readOnlyOptions[0].entityNames).to.deep.equal(new Set(['A', 'C']));

          expect(embeddedOptions).to.have.length(1);
          expect(embeddedOptions[0].entityNames).to.deep.equal(new Set(['B', 'C']));
        });
      });
      context('when having a pattern validation with a quote in it', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'pattern_validation_with_quote.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
            applicationType: ApplicationTypes.MONOLITH,
          });
        });

        it('formats it', () => {
          expect(jdlObject.getEntity('Alumni').fields.firstName.validations.pattern.value.includes("\\'")).be.true;
        });
      });
      context('when parsing a JDL with the unique constraint', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles([path.join(__dirname, '..', '..', 'test-files', 'unique.jdl')]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
            applicationType: ApplicationTypes.MONOLITH,
          });
        });

        it('should accept it', () => {
          expect(jdlObject.entities.A.fields.myString.validations.unique).not.to.be.undefined;
          expect(jdlObject.entities.A.fields.myInteger.validations.unique).not.to.be.undefined;
        });
      });
      context('when parsing a JDL relationship with JPA derived identifier enabled', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles([
            path.join(__dirname, '..', '..', 'test-files', 'relationship_jpa_derived_identifier.jdl'),
          ]);
          jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
            parsedContent: input,
            applicationType: ApplicationTypes.MONOLITH,
          });
        });

        it('should set it', () => {
          expect(jdlObject.relationships.getOneToOne('OneToOne_A{b}_B').options.global).to.deep.equal({
            jpaDerivedIdentifier: true,
          });
        });
      });
      context('when parsing entity options in applications', () => {
        context('if the entity list does not contain some entities mentioned in options', () => {
          let parsedContent;

          before(() => {
            parsedContent = JDLReader.parseFromContent(`application {
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
              ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
                parsedContent,
              })
            ).to.throw(/^The entity B in the readOnly option isn't declared in testApp1's entity list.$/);
          });
        });
        context('if the entity list contains all the entities mentioned in options', () => {
          let optionsForFirstApplication;
          let optionsForSecondApplication;

          before(() => {
            const input = JDLReader.parseFromContent(`application {
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
            const jdlObject = ParsedJDLToJDLObjectConverter.parseFromConfigurationObject({
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
