/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

const JDLReader = require('../../../lib/readers/jdl_reader');
const DocumentParser = require('../../../lib/parsers/document_parser');
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
  describe('::parse', () => {
    context('when passing invalid args', () => {
      context('because there is no document', () => {
        it('fails', () => {
          expect(() => {
            DocumentParser.parseFromConfigurationObject({});
          }).to.throw('The parsed JDL content must be passed.');
        });
      });
    });
    context('when passing valid args', () => {
      context('with no error', () => {
        let jdlObject = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/complex_jdl.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
          });
        });

        it('builds a JDLObject', () => {
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
          expect(jdlObject.getEnum('JobType')).to.deep.eq(
            new JDLEnum({
              name: 'JobType',
              values: ['TYPE1', 'TYPE2']
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
                      value: 5
                    }),
                    maxlength: new JDLValidation({
                      name: Validations.MAXLENGTH,
                      value: 25
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
              name: BinaryOptions.SEARCH_ENGINE,
              entityNames: ['Employee'],
              value: BinaryOptionValues.searchEngine.ELASTIC_SEARCH
            })
          ]);
        });
      });
      context('with an application type', () => {
        let input = null;

        before(() => {
          input = JDLReader.parseFromFiles(['./test/test_files/invalid_field_type.jdl']);
        });

        it("doesn't check for field types", () => {
          DocumentParser.parseFromConfigurationObject({
            document: input,
            applicationType: ApplicationTypes.GATEWAY
          });
        });
      });
      context('with a required relationship', () => {
        let jdlObject = null;
        let relationship = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/required_relationships.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
          });
          relationship = jdlObject.relationships.getOneToOne('OneToOne_A{b}_B{a}');
        });

        it('adds it', () => {
          expect(relationship.isInjectedFieldInFromRequired).to.be.true;
          expect(relationship.isInjectedFieldInToRequired).to.be.false;
        });
      });
      context("with a field name 'id'", () => {
        let jdlObject = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/id_field.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
          });
        });

        it("doesn't add it", () => {
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
        let jdlObject = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/user_entity_to_relationship.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
          });
        });

        it('is processed', () => {
          expect(jdlObject.relationships.getManyToOne('ManyToOne_A{user}_User{a}').to).to.eq('User');
          expect(jdlObject.relationships.getOneToOne('OneToOne_B{user}_User').to).to.eq('User');
        });
      });
      context('with an invalid option', () => {
        let input = null;

        before(() => {
          input = JDLReader.parseFromFiles(['./test/test_files/invalid_option.jdl']);
        });

        it('fails', () => {
          expect(() => {
            DocumentParser.parseFromConfigurationObject({
              document: input
            });
          }).to.throw("The option's name and value must be valid to create an option, got value 'wrong' for 'dto'.");
        });
      });
      context('with a required enum', () => {
        let jdlObject = null;
        let enumField = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/enum.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
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

        it('adds it', () => {
          expect(jdlObject.getEnum('MyEnum')).to.deep.eq(
            new JDLEnum({
              name: 'MyEnum',
              values: ['AAA', 'BBB', 'CCC']
            })
          );
          expect(jdlObject.entities.MyEntity.fields.sourceType).to.deep.eq(enumField);
        });
      });
      context('when using the noFluentMethods option', () => {
        let input = null;
        let jdlObject = null;

        before(() => {
          input = JDLReader.parseFromFiles(['./test/test_files/fluent_methods.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
          });
        });

        it('adds it correctly', () => {
          expect(jdlObject.getOptions()).to.deep.eq([
            new JDLUnaryOption({
              name: UnaryOptions.NO_FLUENT_METHOD,
              entityNames: ['A']
            })
          ]);
        });
      });
      context('when having following comments', () => {
        let jdlObject = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/following_comments.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
          });
        });

        it('accepts them', () => {
          expect(jdlObject.entities.A.fields.name.comment).to.eq('abc');
          expect(jdlObject.entities.A.fields.thing.comment).to.eq('def');
          expect(jdlObject.entities.A.fields.another.comment).to.eq(undefined);
        });
        context('when having both forms of comments', () => {
          it('only accepts the one defined first', () => {
            expect(jdlObject.entities.B.fields.name.comment).to.eq('xyz');
          });
        });
        context('when using commas', () => {
          it('assigns the comment to the next field', () => {
            expect(jdlObject.entities.C.fields.name.comment).to.be.undefined;
            expect(jdlObject.entities.C.fields.thing.comment).to.eq('abc');
          });
        });
      });
      context('when parsing another complex JDL file', () => {
        let jdlObject = null;
        let options = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/complex_jdl_2.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
          });
          options = jdlObject.getOptions();
        });

        context('checking the entities', () => {
          it('parses them', () => {
            expect(jdlObject.entities.A).to.deep.eq({
              name: 'A',
              tableName: 'A',
              fields: {},
              comment: undefined
            });
            expect(jdlObject.entities.B).to.deep.eq({
              name: 'B',
              tableName: 'B',
              fields: {},
              comment: undefined
            });
            expect(jdlObject.entities.C).to.deep.eq({
              name: 'C',
              tableName: 'C',
              fields: {
                name: {
                  comment: undefined,
                  name: 'name',
                  type: 'String',
                  validations: {
                    required: {
                      name: 'required',
                      value: ''
                    }
                  }
                }
              },
              comment: undefined
            });
            expect(jdlObject.entities.D).to.deep.eq({
              name: 'D',
              tableName: 'D',
              fields: {
                name: {
                  comment: undefined,
                  name: 'name',
                  type: 'String',
                  validations: {
                    required: {
                      name: 'required',
                      value: ''
                    },
                    minlength: {
                      name: 'minlength',
                      value: 1
                    },
                    maxlength: {
                      name: 'maxlength',
                      value: 42
                    }
                  }
                },
                count: {
                  comment: undefined,
                  name: 'count',
                  type: 'Integer',
                  validations: {}
                }
              },
              comment: undefined
            });
            expect(jdlObject.entities.E).to.deep.eq({
              name: 'E',
              tableName: 'E',
              fields: {},
              comment: undefined
            });
            expect(jdlObject.entities.F).to.deep.eq({
              name: 'F',
              tableName: 'F',
              fields: {
                name: {
                  comment: 'My comment for name of F.',
                  name: 'name',
                  type: 'String',
                  validations: {}
                },
                count: {
                  comment: undefined,
                  name: 'count',
                  type: 'Integer',
                  validations: {}
                },
                flag: {
                  comment: 'My comment for flag of F.',
                  name: 'flag',
                  type: 'Boolean',
                  validations: {
                    required: {
                      name: 'required',
                      value: ''
                    }
                  }
                }
              },
              comment: 'My comment for F.'
            });
            expect(jdlObject.entities.G).to.deep.eq({
              name: 'G',
              tableName: 'G',
              fields: {
                name: {
                  comment: 'xyz',
                  name: 'name',
                  type: 'String',
                  validations: {
                    required: {
                      name: 'required',
                      value: ''
                    }
                  }
                },
                count: {
                  comment: 'def',
                  name: 'count',
                  type: 'Integer',
                  validations: {}
                }
              },
              comment: undefined
            });
          });
        });
        context('checking the options', () => {
          it('parses them', () => {
            expect(options.length).to.eq(7);
            expect(options[0].name).to.equal('skipClient');
            expect(options[1].name).to.equal('skipServer');
            expect(options[2].name).to.equal('dto');
            expect(options[2].value).to.equal('mapstruct');
            expect(options[3].name).to.equal('service');
            expect(options[3].value).to.equal('serviceImpl');
            expect(options[4].name).to.equal('service');
            expect(options[4].value).to.equal('serviceClass');
            expect(options[5].name).to.equal('pagination');
            expect(options[5].value).to.equal('pager');
            expect(options[6].name).to.equal('pagination');
            expect(options[6].value).to.equal('pagination');
          });
        });
      });
      context('when having two consecutive comments for fields', () => {
        let jdlObject = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/field_comments.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
          });
        });

        it('assigns them correctly', () => {
          expect(jdlObject.entities.TestEntity.fields).to.deep.eq({
            first: {
              name: 'first',
              comment: 'first comment',
              type: 'String',
              validations: {}
            },
            second: {
              name: 'second',
              comment: 'second comment',
              type: 'String',
              validations: {}
            },
            third: {
              name: 'third',
              comment: undefined,
              type: 'Integer',
              validations: {}
            },
            fourth: {
              name: 'fourth',
              comment: undefined,
              type: 'String',
              validations: {}
            }
          });
          expect(jdlObject.entities.TestEntity2.fields).to.deep.eq({
            first: {
              name: 'first',
              comment: 'first comment',
              type: 'String',
              validations: {
                required: {
                  name: 'required',
                  value: ''
                }
              }
            },
            second: {
              name: 'second',
              comment: 'second comment',
              type: 'String',
              validations: {}
            }
          });
        });
      });
      context('when having constants', () => {
        let jdlObject = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/constants.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
          });
        });

        it("assigns the constants' value when needed", () => {
          expect(jdlObject.entities.A.fields).to.deep.eq({
            name: {
              name: 'name',
              comment: undefined,
              type: 'String',
              validations: {
                minlength: {
                  name: 'minlength',
                  value: 1
                },
                maxlength: {
                  name: 'maxlength',
                  value: 42
                }
              }
            },
            content: {
              name: 'content',
              comment: undefined,
              type: 'TextBlob',
              validations: {
                minbytes: {
                  name: 'minbytes',
                  value: 20
                },
                maxbytes: {
                  name: 'maxbytes',
                  value: 40
                }
              }
            },
            count: {
              name: 'count',
              comment: undefined,
              type: 'Integer',
              validations: {
                min: {
                  name: 'min',
                  value: 0
                },
                max: {
                  name: 'max',
                  value: 41
                }
              }
            }
          });
        });
      });
      context('when having a cassandra app with paginated entities', () => {
        let input = null;

        before(() => {
          input = JDLReader.parseFromFiles(['./test/test_files/cassandra_jdl.jdl']);
        });

        it('fails', () => {
          try {
            DocumentParser.parseFromConfigurationObject({
              document: input
            });
          } catch (error) {
            expect(error.name).to.eq('IllegalOptionException');
          }
        });
      });
      context('when parsing applications', () => {
        let application = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/application.jdl']);
          const jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
          });
          application = jdlObject.applications.toto.config;
        });

        it('parses it', () => {
          expect(application.languages.has('en') && application.languages.has('fr')).to.be.true;
          expect(application.testFrameworks.size).to.equal(0);
          delete application.languages;
          delete application.testFrameworks;

          expect(application).to.deep.equal({
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
      });
      context('when parsing deployments', () => {
        let deployment = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/deployments.jdl']);
          const jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
          });
          deployment = jdlObject.deployments['docker-compose'];
        });

        it('parses it', () => {
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
        let jdlObject = null;
        let filterOption = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/filtering_without_service.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
          });
          filterOption = jdlObject.getOptionsForName(UnaryOptions.FILTER)[0];
        });

        it('works', () => {
          expect(filterOption.entityNames.has('*')).to.be.true;
          expect(filterOption.excludedNames.has('B')).to.be.true;
        });
      });
      context('when parsing entities with a custom client root folder', () => {
        context('inside a microservice app', () => {
          let jdlObject = null;
          let clientRootFolderOption = null;

          before(() => {
            const input = JDLReader.parseFromFiles(['./test/test_files/simple_microservice_setup.jdl']);
            jdlObject = DocumentParser.parseFromConfigurationObject({
              document: input,
              applicationType: ApplicationTypes.MICROSERVICE,
              applicationName: 'ms'
            });
            clientRootFolderOption = jdlObject.getOptionsForName(BinaryOptions.CLIENT_ROOT_FOLDER)[0];
          });

          it('sets the microservice name as clientRootFolder', () => {
            expect(clientRootFolderOption.value).to.equal('ms');
          });
        });
        context('inside any other app', () => {
          let jdlObject = null;
          let clientRootFolderOption = null;

          before(() => {
            const input = JDLReader.parseFromFiles(['./test/test_files/client_root_folder.jdl']);
            jdlObject = DocumentParser.parseFromConfigurationObject({
              document: input,
              applicationType: ApplicationTypes.MONOLITH
            });
            clientRootFolderOption = jdlObject.getOptionsForName(BinaryOptions.CLIENT_ROOT_FOLDER)[0];
          });

          it("sets the option's value", () => {
            expect(clientRootFolderOption.entityNames.has('*')).to.be.true;
            expect(clientRootFolderOption.excludedNames.has('C')).to.be.true;
            expect(clientRootFolderOption.value).to.equal('test-root');
          });
        });
      });
      context('when parsing a JDL inside a microservice app', () => {
        context('without the microservice option in the JDL', () => {
          let jdlObject = null;
          let microserviceOption = null;

          before(() => {
            const input = JDLReader.parseFromFiles(['./test/test_files/no_microservice.jdl']);
            jdlObject = DocumentParser.parseFromConfigurationObject({
              document: input,
              applicationType: ApplicationTypes.MICROSERVICE,
              applicationName: 'toto'
            });
            microserviceOption = jdlObject.getOptionsForName(BinaryOptions.MICROSERVICE)[0];
          });

          it('adds it to every entity', () => {
            expect(jdlObject.getOptionQuantity()).to.equal(2);
            expect(microserviceOption.entityNames).to.deep.equal(new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G']));
          });
        });
        context('with the microservice option in the JDL', () => {
          let jdlObject = null;
          let microserviceOption = null;

          before(() => {
            const input = JDLReader.parseFromFiles(['./test/test_files/simple_microservice_setup.jdl']);
            jdlObject = DocumentParser.parseFromConfigurationObject({
              document: input,
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
        let jdlObject = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/application_with_entities.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input
          });
        });

        it('adds the application entities in the application object', () => {
          expect(jdlObject.applications.MyApp.entityNames.has('BankAccount')).to.be.true;
          expect(jdlObject.applications.MyApp.entityNames.size).to.equal(1);
        });
      });
      context('when parsing a relationship with no injected field', () => {
        let jdlObject = null;
        let relationshipOneToOne = null;
        let relationshipOneToMany = null;
        let relationshipManyToMany = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/no_injected_field.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input,
            applicationType: ApplicationTypes.MONOLITH
          });
          relationshipOneToOne = jdlObject.relationships.getOneToOne('OneToOne_A{b}_B{a}');
          relationshipOneToMany = jdlObject.relationships.getOneToMany('OneToMany_A{b}_B{a}');
          relationshipManyToMany = jdlObject.relationships.getManyToMany('ManyToMany_A{b}_B{a}');
        });

        it('adds a default one', () => {
          expect(relationshipOneToOne.injectedFieldInTo).to.equal('a');
          expect(relationshipOneToOne.injectedFieldInFrom).to.equal('b');
          expect(relationshipOneToMany.injectedFieldInTo).to.equal('a');
          expect(relationshipOneToMany.injectedFieldInFrom).to.equal('b');
          expect(relationshipManyToMany.injectedFieldInTo).to.equal('a');
          expect(relationshipManyToMany.injectedFieldInFrom).to.equal('b');
        });
      });
      context('when parsing entities with annotations', () => {
        let dtoOption = null;
        let filterOption = null;
        let paginationOption = null;
        let serviceOption = null;
        let skipClientOption = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/annotations.jdl']);
          const jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input,
            applicationType: ApplicationTypes.MONOLITH
          });
          dtoOption = jdlObject.getOptionsForName(BinaryOptions.DTO)[0];
          filterOption = jdlObject.getOptionsForName(UnaryOptions.FILTER)[0];
          paginationOption = jdlObject.getOptionsForName(BinaryOptions.PAGINATION)[0];
          serviceOption = jdlObject.getOptionsForName(BinaryOptions.SERVICE)[0];
          skipClientOption = jdlObject.getOptionsForName(UnaryOptions.SKIP_CLIENT)[0];
        });

        it('sets the annotations as options', () => {
          expect(dtoOption.entityNames).to.deep.equal(new Set(['A', 'B']));
          expect(filterOption.entityNames).to.deep.equal(new Set(['C']));
          expect(paginationOption.entityNames).to.deep.equal(new Set(['B', 'C']));
          expect(serviceOption.entityNames).to.deep.equal(new Set(['A', 'B']));
          expect(skipClientOption.entityNames).to.deep.equal(new Set(['A', 'C']));
        });
      });
      context('when parsing a mix between annotations and regular options', () => {
        let dtoOptions = null;
        let filterOptions = null;
        let paginationOptions = null;
        let serviceOptions = null;
        let skipClientOptions = null;
        let skipServerOptions = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/annotations_and_options.jdl']);
          const jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input,
            applicationType: ApplicationTypes.MONOLITH
          });
          dtoOptions = jdlObject.getOptionsForName(BinaryOptions.DTO);
          filterOptions = jdlObject.getOptionsForName(UnaryOptions.FILTER);
          paginationOptions = jdlObject.getOptionsForName(BinaryOptions.PAGINATION);
          serviceOptions = jdlObject.getOptionsForName(BinaryOptions.SERVICE);
          skipClientOptions = jdlObject.getOptionsForName(UnaryOptions.SKIP_CLIENT);
          skipServerOptions = jdlObject.getOptionsForName(UnaryOptions.SKIP_SERVER);
        });

        it('correctly sets the options', () => {
          expect(dtoOptions).to.have.length(1);
          expect(dtoOptions[0].entityNames).to.deep.equal(new Set(['A', 'B']));

          expect(filterOptions).to.have.length(1);
          expect(filterOptions[0].entityNames).to.deep.equal(new Set(['C']));

          expect(paginationOptions).to.have.length(2);
          expect(paginationOptions[0].entityNames).to.deep.equal(new Set(['B', 'C']));
          expect(paginationOptions[1].entityNames).to.deep.equal(new Set(['B', 'C']));

          expect(serviceOptions).to.have.length(2);
          expect(serviceOptions[0].entityNames).to.deep.equal(new Set(['A', 'B']));
          expect(serviceOptions[1].entityNames).to.deep.equal(new Set(['A']));

          expect(skipClientOptions).to.have.length(1);
          expect(skipClientOptions[0].entityNames).to.deep.equal(new Set(['A', 'C']));

          expect(skipServerOptions).to.have.length(1);
          expect(skipServerOptions[0].entityNames).to.deep.equal(new Set(['A']));
        });
      });
      context('when having a pattern validation with a quote in it', () => {
        let jdlObject = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/pattern_validation_with_quote.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input,
            applicationType: ApplicationTypes.MONOLITH
          });
        });

        it('formats it', () => {
          expect(jdlObject.getEntity('Alumni').fields.firstName.validations.pattern.value.includes("\\'")).be.true;
        });
      });
      context('when parsing a JDL with the unique constraint', () => {
        let jdlObject = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/unique.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input,
            applicationType: ApplicationTypes.MONOLITH
          });
        });

        it('accepts it', () => {
          expect(jdlObject.entities.A.fields.myString.validations.unique).not.to.be.undefined;
          expect(jdlObject.entities.A.fields.myInteger.validations.unique).not.to.be.undefined;
        });
      });
      context('when parsing a JDL relationship with JPA derived identifier enabled', () => {
        let jdlObject = null;

        before(() => {
          const input = JDLReader.parseFromFiles(['./test/test_files/relationship_jpa_derived_identifier.jdl']);
          jdlObject = DocumentParser.parseFromConfigurationObject({
            document: input,
            applicationType: ApplicationTypes.MONOLITH
          });
        });

        it('sets it', () => {
          expect(jdlObject.relationships.getOneToOne('OneToOne_A{b}_B').options.has('jpaDerivedIdentifier')).to.be.true;
        });
      });
    });
  });
});
