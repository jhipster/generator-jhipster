/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new, no-unused-expressions */
const { expect } = require('chai');

const { matchEntity } = require('../../matchers/entity_matcher');
const JDLReader = require('../../../lib/readers/jdl_reader');
const DocumentParser = require('../../../lib/parsers/document_parser');
const { createJDLApplication } = require('../../../lib/core/jdl_application_factory');
const JDLEntity = require('../../../lib/core/jdl_entity');
const JDLEnum = require('../../../lib/core/jdl_enum');
const JDLField = require('../../../lib/core/jdl_field');
const JDLValidation = require('../../../lib/core/jdl_validation');
const JDLUnaryOption = require('../../../lib/core/jdl_unary_option');
const JDLBinaryOption = require('../../../lib/core/jdl_binary_option');
const ApplicationTypes = require('../../../lib/core/jhipster/application_types');
const FieldTypes = require('../../../lib/core/jhipster/field_types').CommonDBTypes;
const Validations = require('../../../lib/core/jhipster/validations');
const UnaryOptions = require('../../../lib/core/jhipster/unary_options');
const BinaryOptions = require('../../../lib/core/jhipster/binary_options').Options;
const BinaryOptionValues = require('../../../lib/core/jhipster/binary_options').Values;

describe('DocumentParser', () => {
  describe('parse', () => {
    context('when passing invalid args', () => {
      context('because there is no parsedContent', () => {
        it('should fail', () => {
          expect(() => {
            DocumentParser.parseFromConfigurationObject({});
          }).to.throw(/^The parsed JDL content must be passed\.$/);
        });
      });
    });
    context('when passing valid args', () => {
      context('with no error', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/complex_jdl.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
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
                  type: FieldTypes.UUID,
                  validations: {
                    required: new JDLValidation({ name: Validations.REQUIRED })
                  }
                }),
                name: new JDLField({
                  name: 'name',
                  type: FieldTypes.STRING,
                  validations: {
                    required: new JDLValidation({ name: Validations.REQUIRED }),
                    unique: new JDLValidation({ name: Validations.UNIQUE })
                  }
                }),
                description: new JDLField({
                  name: 'description',
                  type: FieldTypes.TEXT_BLOB
                }),
                advertisement: new JDLField({
                  name: 'advertisement',
                  type: FieldTypes.BLOB
                }),
                logo: new JDLField({
                  name: 'logo',
                  type: FieldTypes.IMAGE_BLOB
                })
              }
            })
          );
          expect(jdlObject.entities.JobHistory).to.deep.eq(
            new JDLEntity({
              name: 'JobHistory',
              tableName: 'JobHistory',
              fields: {
                startDate: new JDLField({
                  name: 'startDate',
                  type: FieldTypes.ZONED_DATE_TIME
                }),
                endDate: new JDLField({
                  name: 'endDate',
                  type: FieldTypes.ZONED_DATE_TIME
                }),
                language: new JDLField({ name: 'language', type: 'Language' })
              },
              comment: 'JobHistory comment.'
            })
          );
          expect(jdlObject.getEnum('JobType')).to.deep.equal(
            new JDLEnum({
              name: 'JobType',
              values: [{ key: 'TYPE1' }, { key: 'TYPE2' }]
            })
          );
          expect(jdlObject.entities.Job).to.deep.eq(
            new JDLEntity({
              name: 'Job',
              tableName: 'Job',
              fields: {
                jobTitle: new JDLField({
                  name: 'jobTitle',
                  type: FieldTypes.STRING,
                  validations: {
                    minlength: new JDLValidation({
                      name: Validations.MINLENGTH,
                      value: '5'
                    }),
                    maxlength: new JDLValidation({
                      name: Validations.MAXLENGTH,
                      value: '25'
                    })
                  }
                }),
                jobType: new JDLField({ name: 'jobType', type: 'JobType' }),
                minSalary: new JDLField({
                  name: 'minSalary',
                  type: FieldTypes.LONG
                }),
                maxSalary: new JDLField({
                  name: 'maxSalary',
                  type: FieldTypes.LONG
                })
              }
            })
          );
          expect(jdlObject.getOptions()).to.deep.eq([
            new JDLUnaryOption({
              name: UnaryOptions.SKIP_SERVER,
              entityNames: ['Country']
            }),
            new JDLBinaryOption({
              name: BinaryOptions.DTO,
              entityNames: ['Employee'],
              value: BinaryOptionValues.dto.MAPSTRUCT
            }),
            new JDLBinaryOption({
              name: BinaryOptions.SERVICE,
              entityNames: ['Employee'],
              value: BinaryOptionValues.service.SERVICE_CLASS
            }),
            new JDLBinaryOption({
              name: BinaryOptions.PAGINATION,
              entityNames: ['JobHistory', 'Employee'],
              value: BinaryOptionValues.pagination['INFINITE-SCROLL']
            }),
            new JDLBinaryOption({
              name: BinaryOptions.PAGINATION,
              entityNames: ['Job'],
              value: BinaryOptionValues.pagination.PAGINATION
            }),
            new JDLBinaryOption({
              name: BinaryOptions.MICROSERVICE,
              entityNames: ['*'],
              value: 'mymicroservice'
            }),
            new JDLBinaryOption({
              name: BinaryOptions.SEARCH,
              entityNames: ['Employee'],
              value: BinaryOptionValues.search.ELASTIC_SEARCH
            })
          ]);
        });
      });
      context('with an application type', () => {
        let input;

        before(() => {
          input = JDLReader.parseFromFiles(['./test/test_files/invalid_field_type.jdl']);
        });

        it('should not check for field types', () => {
          DocumentParser.parseFromConfigurationObject({
            parsedContent: input,
            applicationType: ApplicationTypes.GATEWAY
          });
        });
      });
      context('with a required relationship', () => {
        let jdlObject;
        let relationship;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/required_relationships.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
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
          const input = JDLReader.parseFromFiles(['./test/test_files/id_field.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
          });
        });

        it('should not add it', () => {
          expect(jdlObject.entities.A).to.deep.eq(
            new JDLEntity({
              name: 'A',
              tableName: 'A',
              fields: {
                email: new JDLField({ name: 'email', type: FieldTypes.STRING })
              }
            })
          );
        });
      });
      context('with User entity as destination for a relationship', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/user_entity_to_relationship.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
          });
        });

        it('is processed', () => {
          expect(jdlObject.relationships.getManyToOne('ManyToOne_A{user}_User').to).to.equal('User');
          expect(jdlObject.relationships.getOneToOne('OneToOne_B{user}_User').to).to.equal('User');
        });
      });
      context('with Authority entity as destination for a relationship', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/authority_entity_to_relationship.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
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
          input = JDLReader.parseFromFiles(['./test/test_files/invalid_option.jdl']);
        });

        it('should not fail', () => {
          DocumentParser.parseFromConfigurationObject({
            parsedContent: input
          });
        });
      });
      context('with a required enum', () => {
        let jdlObject;
        let enumField;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/enum.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
          });
          enumField = new JDLField({
            name: 'sourceType',
            type: 'MyEnum'
          });
          enumField.addValidation(
            new JDLValidation({
              name: Validations.REQUIRED
            })
          );
        });

        it('should add it', () => {
          expect(jdlObject.getEnum('MyEnum')).to.deep.eq(
            new JDLEnum({
              name: 'MyEnum',
              values: [{ key: 'AAA' }, { key: 'BBB' }, { key: 'CCC' }]
            })
          );
          expect(jdlObject.entities.MyEntity.fields.sourceType).to.deep.eq(enumField);
        });
      });
      context('when using the noFluentMethods option', () => {
        let input;
        let jdlObject;

        before(() => {
          input = JDLReader.parseFromFiles(['./test/test_files/fluent_methods.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
          });
        });

        it('should add it correctly', () => {
          expect(jdlObject.getOptions()).to.deep.eq([
            new JDLUnaryOption({
              name: UnaryOptions.NO_FLUENT_METHOD,
              entityNames: ['A']
            })
          ]);
        });
      });
      context('when having following comments', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/following_comments.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
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
          const input = JDLReader.parseFromFiles(['./test/test_files/complex_jdl_2.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
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
            expect(options[0].name).to.equal('skipClient');
            expect(options[1].name).to.equal('skipServer');
            expect(options[2].name).to.equal('dto');
            expect(options[2].value).to.equal('mapstruct');
            expect(options[3].name).to.equal('service');
            expect(options[3].value).to.equal('serviceImpl');
            expect(options[4].name).to.equal('service');
            expect(options[4].value).to.equal('serviceClass');
            expect(options[5].name).to.equal('pagination');
            expect(options[5].value).to.equal('infinite-scroll');
            expect(options[6].name).to.equal('pagination');
            expect(options[6].value).to.equal('pagination');
          });
        });
      });
      context('when having two consecutive comments for fields', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/field_comments.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
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
          const input = JDLReader.parseFromFiles(['./test/test_files/constants.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
          });
        });

        it("should assign the constants' value when needed", () => {
          expect(jdlObject.entities.A.fields.name.validations).to.deep.equal({
            minlength: {
              name: 'minlength',
              value: '1'
            },
            maxlength: {
              name: 'maxlength',
              value: '42'
            }
          });
          expect(jdlObject.entities.A.fields.content.validations).to.deep.equal({
            minbytes: {
              name: 'minbytes',
              value: '20'
            },
            maxbytes: {
              name: 'maxbytes',
              value: '40'
            }
          });
          expect(jdlObject.entities.A.fields.count.validations).to.deep.equal({
            min: {
              name: 'min',
              value: '0'
            },
            max: {
              name: 'max',
              value: '41'
            }
          });
        });
      });
      context('when having a cassandra app with paginated entities', () => {
        let input;

        before(() => {
          input = JDLReader.parseFromFiles(['./test/test_files/cassandra_jdl.jdl']);
        });

        it('should fail', () => {
          try {
            DocumentParser.parseFromConfigurationObject({
              parsedContent: input
            });
          } catch (error) {
            expect(error.name).to.equal('IllegalOptionException');
          }
        });
      });
      context('when parsing applications', () => {
        let parsedConfig;
        let expectedConfig;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/application.jdl']);
          const jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
          });
          parsedConfig = jdlObject.applications.toto;
          expectedConfig = createJDLApplication({
            applicationType: 'monolith',
            authenticationType: 'jwt',
            baseName: 'toto',
            buildTool: 'maven',
            cacheProvider: 'ehcache',
            clientFramework: 'angularX',
            clientTheme: 'none',
            clientThemeVariant: '',
            clientPackageManager: 'npm',
            databaseType: 'sql',
            devDatabaseType: 'h2Disk',
            enableHibernateCache: true,
            enableSwaggerCodegen: false,
            enableTranslation: false,
            jhiPrefix: 'jhi',
            messageBroker: false,
            nativeLanguage: 'en',
            packageFolder: 'com/mathieu/sample',
            packageName: 'com.mathieu.sample',
            prodDatabaseType: 'mysql',
            searchEngine: false,
            serverPort: '8080',
            serviceDiscoveryType: false,
            skipClient: false,
            skipServer: false,
            skipUserManagement: false,
            useSass: true,
            websocket: false
          });
        });

        it('should parse it', () => {
          expect(parsedConfig).to.deep.equal(expectedConfig);
        });
      });
      context('when parsing deployments', () => {
        let deployment;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/deployments.jdl']);
          const jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
          });
          deployment = jdlObject.deployments['docker-compose'];
        });

        it('should parse it', () => {
          expect(deployment.appsFolders).to.deep.equal(new Set(['tata', 'titi']));
          delete deployment.appsFolders;
          delete deployment.clusteredDbApps;
          delete deployment.consoleOptions;

          expect(deployment).to.deep.equal({
            deploymentType: 'docker-compose',
            directoryPath: '../',
            dockerPushCommand: 'docker push',
            dockerRepositoryName: 'test',
            gatewayType: 'zuul',
            monitoring: 'no',
            serviceDiscoveryType: 'eureka'
          });
        });
      });
      context('when parsing filtered entities', () => {
        let jdlObject;
        let filterOption;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/filtering_without_service.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
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
            const input = JDLReader.parseFromFiles(['./test/test_files/simple_microservice_setup.jdl']);
            jdlObject = DocumentParser.parseFromConfigurationObject({
              parsedContent: input,
              applicationType: ApplicationTypes.MICROSERVICE,
              applicationName: 'ms'
            });
            clientRootFolderOption = jdlObject.getOptionsForName(BinaryOptions.CLIENT_ROOT_FOLDER)[0];
          });

          it('should set the microservice name as clientRootFolder', () => {
            expect(clientRootFolderOption.value).to.equal('ms');
          });
        });
        context('inside any other app', () => {
          let jdlObject;
          let clientRootFolderOption;

          before(() => {
            const input = JDLReader.parseFromFiles(['./test/test_files/client_root_folder.jdl']);
            jdlObject = DocumentParser.parseFromConfigurationObject({
              parsedContent: input,
              applicationType: ApplicationTypes.MONOLITH
            });
            clientRootFolderOption = jdlObject.getOptionsForName(BinaryOptions.CLIENT_ROOT_FOLDER)[0];
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
            const input = JDLReader.parseFromFiles(['./test/test_files/no_microservice.jdl']);
            jdlObject = DocumentParser.parseFromConfigurationObject({
              parsedContent: input,
              applicationType: ApplicationTypes.MICROSERVICE,
              applicationName: 'toto'
            });
            microserviceOption = jdlObject.getOptionsForName(BinaryOptions.MICROSERVICE)[0];
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
            const input = JDLReader.parseFromFiles(['./test/test_files/simple_microservice_setup.jdl']);
            jdlObject = DocumentParser.parseFromConfigurationObject({
              parsedContent: input,
              applicationType: ApplicationTypes.MICROSERVICE,
              applicationName: 'toto'
            });
            microserviceOption = jdlObject.getOptionsForName(BinaryOptions.MICROSERVICE)[0];
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
          const input = JDLReader.parseFromFiles(['./test/test_files/application_with_entities.jdl']);
          const jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input
          });
          entityNames = jdlObject.applications.MyApp.getEntityNames();
        });

        it('should add the application entities in the application object', () => {
          expect(entityNames).to.deep.equal(['BankAccount']);
        });
      });
      context('when parsing a relationship with no injected field', () => {
        let jdlObject;
        let relationshipOneToOne;
        let relationshipOneToMany;
        let relationshipManyToMany;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/no_injected_field.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input,
            applicationType: ApplicationTypes.MONOLITH
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
        let dtoOption;
        let filterOption;
        let paginationOption;
        let serviceOption;
        let skipClientOption;
        let customUnaryOption;
        let customBinaryOption;
        let customBinaryOption2;
        let fieldAnnotation;
        let relationshipAnnotation;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/annotations.jdl']);
          const jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input,
            applicationType: ApplicationTypes.MONOLITH
          });
          dtoOption = jdlObject.getOptionsForName(BinaryOptions.DTO)[0];
          filterOption = jdlObject.getOptionsForName(UnaryOptions.FILTER)[0];
          paginationOption = jdlObject.getOptionsForName(BinaryOptions.PAGINATION)[0];
          serviceOption = jdlObject.getOptionsForName(BinaryOptions.SERVICE)[0];
          skipClientOption = jdlObject.getOptionsForName(UnaryOptions.SKIP_CLIENT)[0];
          customUnaryOption = jdlObject.getOptionsForName('myCustomUnaryOption')[0];
          customBinaryOption = jdlObject.getOptionsForName('myCustomBinaryOption')[0];
          customBinaryOption2 = jdlObject.getOptionsForName('myCustomBinaryOption')[1];
          fieldAnnotation = jdlObject.entities.A.fields.name.options.id;
          relationshipAnnotation = jdlObject.relationships.getOneToMany('OneToMany_A{b}_B{a}').options.id;
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
          expect(relationshipAnnotation).to.deep.equal(true);
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
          const input = JDLReader.parseFromFiles(['./test/test_files/annotations_and_options.jdl']);
          const jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input,
            applicationType: ApplicationTypes.MONOLITH
          });
          dtoOptions = jdlObject.getOptionsForName(BinaryOptions.DTO);
          filterOptions = jdlObject.getOptionsForName(UnaryOptions.FILTER);
          paginationOptions = jdlObject.getOptionsForName(BinaryOptions.PAGINATION);
          serviceOptions = jdlObject.getOptionsForName(BinaryOptions.SERVICE);
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
          const input = JDLReader.parseFromFiles(['./test/test_files/pattern_validation_with_quote.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input,
            applicationType: ApplicationTypes.MONOLITH
          });
        });

        it('formats it', () => {
          expect(jdlObject.getEntity('Alumni').fields.firstName.validations.pattern.value.includes("\\'")).be.true;
        });
      });
      context('when parsing a JDL with the unique constraint', () => {
        let jdlObject;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/unique.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input,
            applicationType: ApplicationTypes.MONOLITH
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
          const input = JDLReader.parseFromFiles(['./test/test_files/relationship_jpa_derived_identifier.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            parsedContent: input,
            applicationType: ApplicationTypes.MONOLITH
          });
        });

        it('should set it', () => {
          expect(jdlObject.relationships.getOneToOne('OneToOne_A{b}_B').options.jpaDerivedIdentifier).to.be.true;
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
              DocumentParser.parseFromConfigurationObject({
                parsedContent
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
            const jdlObject = DocumentParser.parseFromConfigurationObject({
              parsedContent: input
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
