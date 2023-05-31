/* eslint-disable camelcase */
/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

/* eslint-disable consistent-return */
import { existsSync } from 'fs';
import chalk from 'chalk';
import os from 'os';

import {
  getDBTypeFromDBValue,
  buildJavaGet as javaGetCall,
  javaBeanCase as javaBeanClassNameFormat,
  buildJavaGetter as javaGetter,
  buildJavaSetter as javaSetter,
  formatDocAsApiDescription,
  formatDocAsJavaDoc,
  getJavaValueGeneratorForType as getJavaValueForType,
  getPrimaryKeyValue as getPKValue,
  generateKeyStore,
  addSpringFactory,
  hibernateSnakeCase,
} from './support/index.mjs';
import { askForOptionalItems, askForServerSideOpts } from './prompts.mjs';

import {
  GENERATOR_BOOTSTRAP_APPLICATION,
  GENERATOR_SPRING_DATA_CASSANDRA,
  GENERATOR_COMMON,
  GENERATOR_SPRING_DATA_COUCHBASE,
  GENERATOR_CUCUMBER,
  GENERATOR_DOCKER,
  GENERATOR_SPRING_DATA_ELASTICSEARCH,
  GENERATOR_GATLING,
  GENERATOR_GRADLE,
  GENERATOR_JAVA,
  GENERATOR_SPRING_CLOUD_STREAM,
  GENERATOR_LANGUAGES,
  GENERATOR_MAVEN,
  GENERATOR_SPRING_DATA_MONGODB,
  GENERATOR_SPRING_DATA_NEO4J,
  GENERATOR_SERVER,
  GENERATOR_SPRING_CACHE,
  GENERATOR_SPRING_WEBSOCKET,
  GENERATOR_SPRING_DATA_RELATIONAL,
} from '../generator-list.mjs';
import BaseApplicationGenerator from '../base-application/index.mjs';
import { writeFiles } from './files.mjs';
import { writeFiles as writeEntityFiles } from './entity-files.mjs';
import { packageJson } from '../../lib/index.mjs';
import {
  SERVER_MAIN_SRC_DIR,
  SERVER_MAIN_RES_DIR,
  SERVER_TEST_SRC_DIR,
  SERVER_TEST_RES_DIR,
  CLIENT_WEBPACK_DIR,
  MAIN_DIR,
  LOGIN_REGEX,
  TEST_DIR,
  JAVA_VERSION,
  JAVA_COMPATIBLE_VERSIONS,
  ADD_SPRING_MILESTONE_REPOSITORY,
  JHIPSTER_DEPENDENCIES_VERSION,
} from '../generator-constants.mjs';
import statistics from '../statistics.mjs';

import {
  applicationTypes,
  authenticationTypes,
  buildToolTypes,
  databaseTypes,
  cacheTypes,
  serviceDiscoveryTypes,
  websocketTypes,
  fieldTypes,
  entityOptions,
  validations,
  reservedKeywords,
  searchEngineTypes,
  messageBrokerTypes,
  clientFrameworkTypes,
  testFrameworkTypes,
} from '../../jdl/jhipster/index.mjs';
import { stringifyApplicationData } from '../base-application/support/index.mjs';
import { createBase64Secret, createSecret, normalizePathEnd, createNeedleCallback } from '../base/support/index.mjs';
import command from './command.mjs';
import { addJavaAnnotation } from '../java/support/index.mjs';
import { isReservedPaginationWords } from '../../jdl/jhipster/reserved-keywords.js';

const dbTypes = fieldTypes;
const {
  STRING: TYPE_STRING,
  INTEGER: TYPE_INTEGER,
  LONG: TYPE_LONG,
  BIG_DECIMAL: TYPE_BIG_DECIMAL,
  FLOAT: TYPE_FLOAT,
  DOUBLE: TYPE_DOUBLE,
  LOCAL_DATE: TYPE_LOCAL_DATE,
  ZONED_DATE_TIME: TYPE_ZONED_DATE_TIME,
  INSTANT: TYPE_INSTANT,
  DURATION: TYPE_DURATION,
} = dbTypes.CommonDBTypes;
const { CUCUMBER, GATLING } = testFrameworkTypes;

const { SUPPORTED_VALIDATION_RULES } = validations;
const { isReservedTableName } = reservedKeywords;
const { ANGULAR, REACT, VUE } = clientFrameworkTypes;
const { JWT, OAUTH2, SESSION } = authenticationTypes;
const { GRADLE, MAVEN } = buildToolTypes;
const { EUREKA } = serviceDiscoveryTypes;
const { CAFFEINE, EHCACHE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS, NO: NO_CACHE } = cacheTypes;
const { NO: NO_WEBSOCKET, SPRING_WEBSOCKET } = websocketTypes;
const { CASSANDRA, COUCHBASE, MONGODB, NEO4J, SQL, NO: NO_DATABASE } = databaseTypes;
const { MICROSERVICE, GATEWAY } = applicationTypes;
const { KAFKA, PULSAR } = messageBrokerTypes;

const { NO: NO_SEARCH_ENGINE, ELASTICSEARCH } = searchEngineTypes;
const { CommonDBTypes, RelationalOnlyDBTypes } = fieldTypes;
const { INSTANT } = CommonDBTypes;
const { BYTES, BYTE_BUFFER } = RelationalOnlyDBTypes;
const { PaginationTypes, ServiceTypes } = entityOptions;
const {
  Validations: { MAX, MIN, MAXLENGTH, MINLENGTH, MAXBYTES, MINBYTES, PATTERN },
} = validations;

const WAIT_TIMEOUT = 3 * 60000;
const { NO: NO_PAGINATION } = PaginationTypes;
const { NO: NO_SERVICE } = ServiceTypes;

/**
 * @class
 * @extends {BaseApplicationGenerator<import('./index.mjs').GeneratorDefinition>}
 */
export default class JHipsterServerGenerator extends BaseApplicationGenerator {
  /** @type {string} */
  jhipsterDependenciesVersion;
  /** @type {string} */
  projectVersion;
  fakeKeytool;

  async beforeQueue() {
    this.loadStoredAppOptions();
    this.loadRuntimeOptions();

    // TODO depend on GENERATOR_BOOTSTRAP_APPLICATION_SERVER.
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    await this.dependsOnJHipster(GENERATOR_COMMON);
    await this.dependsOnJHipster(GENERATOR_JAVA);

    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_SERVER);
    }

    // Not using normal blueprints or this is a normal blueprint.
    if ((!this.fromBlueprint && !this.delegateToBlueprint) || (this.fromBlueprint && this.sbsBlueprint)) {
      this.setFeatures({
        customInstallTask: async function customInstallTask(preferredPm, defaultInstallTask) {
          const buildTool = this.jhipsterConfig.buildTool;
          if (
            (preferredPm && preferredPm !== 'npm') ||
            this.skipClient ||
            this.jhipsterConfig.skipClient ||
            (buildTool !== GRADLE && buildTool !== MAVEN)
          ) {
            return defaultInstallTask();
          }

          const npmCommand = process.platform === 'win32' ? 'npmw' : './npmw';
          try {
            await this.spawnCommand(npmCommand, ['install'], { preferLocal: true });
          } catch (error) {
            this.log.error(chalk.red(`Error executing '${npmCommand} install', please execute it yourself. (${error.shortMessage})`));
          }
          return true;
        }.bind(this),
      });
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      loadConfig() {
        this.parseJHipsterOptions(command.options);
      },

      setupRequiredConfig() {
        if (!this.jhipsterConfig.applicationType) {
          this.jhipsterConfig.applicationType = 'monolith';
        }
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup(this.delegateTasksToBlueprint(() => this.initializing));
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      askForServerSideOpts,
      askForOptionalItems,
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup(this.delegateTasksToBlueprint(() => this.prompting));
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configServerPort() {
        if (!this.jhipsterConfig.serverPort && this.jhipsterConfig.applicationIndex) {
          this.jhipsterConfig.serverPort = 8080 + this.jhipsterConfig.applicationIndex;
        }
      },
      forceReactiveGateway() {
        if (this.jhipsterConfig.applicationType === GATEWAY) {
          if (this.jhipsterConfig.reactive !== undefined && !this.jhipsterConfig.reactive) {
            this.log.warn('Non reactive gateway is not supported. Switching to reactive.');
          }
          this.jhipsterConfig.reactive = true;
        }
      },
      configure() {
        this._configureServer();
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.asConfiguringTaskGroup(this.delegateTasksToBlueprint(() => this.configuring));
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        const { buildTool, enableTranslation, databaseType, messageBroker, searchEngine, testFrameworks, websocket, cacheProvider } =
          this.jhipsterConfigWithDefaults;
        if (buildTool === GRADLE) {
          await this.composeWithJHipster(GENERATOR_GRADLE);
        } else if (buildTool === MAVEN) {
          await this.composeWithJHipster(GENERATOR_MAVEN);
        } else {
          throw new Error(`Build tool ${buildTool} is not supported`);
        }

        await this.composeWithJHipster(GENERATOR_DOCKER);

        // We don't expose client/server to cli, composing with languages is used for test purposes.
        if (enableTranslation) {
          await this.composeWithJHipster(GENERATOR_LANGUAGES);
        }
        if (databaseType === SQL) {
          await this.composeWithJHipster(GENERATOR_SPRING_DATA_RELATIONAL);
        } else if (databaseType === CASSANDRA) {
          await this.composeWithJHipster(GENERATOR_SPRING_DATA_CASSANDRA);
        } else if (databaseType === COUCHBASE) {
          await this.composeWithJHipster(GENERATOR_SPRING_DATA_COUCHBASE);
        } else if (databaseType === MONGODB) {
          await this.composeWithJHipster(GENERATOR_SPRING_DATA_MONGODB);
        } else if (databaseType === NEO4J) {
          await this.composeWithJHipster(GENERATOR_SPRING_DATA_NEO4J);
        }
        if (messageBroker === KAFKA || messageBroker === PULSAR) {
          await this.composeWithJHipster(GENERATOR_SPRING_CLOUD_STREAM);
        }
        if (searchEngine === ELASTICSEARCH) {
          await this.composeWithJHipster(GENERATOR_SPRING_DATA_ELASTICSEARCH);
        }
        if (testFrameworks?.includes(CUCUMBER)) {
          await this.composeWithJHipster(GENERATOR_CUCUMBER);
        }
        if (testFrameworks?.includes(GATLING)) {
          await this.composeWithJHipster(GENERATOR_GATLING);
        }
        if (websocket === SPRING_WEBSOCKET) {
          await this.composeWithJHipster(GENERATOR_SPRING_WEBSOCKET);
        }
        if ([EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS].includes(cacheProvider)) {
          await this.composeWithJHipster(GENERATOR_SPRING_CACHE);
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.asComposingTaskGroup(this.delegateTasksToBlueprint(() => this.composing));
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadEnvironmentVariables({ application }) {
        application.packageInfoJavadocs?.push(
          { packageName: `${application.packageName}.aop.logging`, documentation: 'Logging aspect.' },
          { packageName: `${application.packageName}.management`, documentation: 'Application management.' },
          { packageName: `${application.packageName}.repository.rowmapper`, documentation: 'Webflux database column mapper.' },
          { packageName: `${application.packageName}.security`, documentation: 'Application security utilities.' },
          { packageName: `${application.packageName}.service.dto`, documentation: 'Data transfer objects for rest mapping.' },
          { packageName: `${application.packageName}.service.mapper`, documentation: 'Data transfer objects mappers.' },
          { packageName: `${application.packageName}.web.filter`, documentation: 'Request chain filters.' },
          { packageName: `${application.packageName}.web.rest.errors`, documentation: 'Rest layer error handling.' },
          { packageName: `${application.packageName}.web.rest.vm`, documentation: 'Rest layer visual models.' }
        );
        application.defaultPackaging = process.env.JHI_WAR === '1' ? 'war' : 'jar';
        if (application.defaultPackaging === 'war') {
          this.log.info(`Using ${application.defaultPackaging} as default packaging`);
        }

        const JHI_PROFILE = process.env.JHI_PROFILE;
        application.defaultEnvironment = (JHI_PROFILE || '').includes('dev') ? 'dev' : 'prod';
        if (JHI_PROFILE) {
          this.log.info(`Using ${application.defaultEnvironment} as default profile`);
        }
      },

      setupServerconsts({ control, application }) {
        // Make constants available in templates
        application.MAIN_DIR = MAIN_DIR;
        application.TEST_DIR = TEST_DIR;
        application.LOGIN_REGEX = LOGIN_REGEX;
        application.CLIENT_WEBPACK_DIR = CLIENT_WEBPACK_DIR;
        application.SERVER_MAIN_SRC_DIR = SERVER_MAIN_SRC_DIR;
        application.SERVER_MAIN_RES_DIR = SERVER_MAIN_RES_DIR;
        application.SERVER_TEST_SRC_DIR = SERVER_TEST_SRC_DIR;
        application.SERVER_TEST_RES_DIR = SERVER_TEST_RES_DIR;

        application.JAVA_VERSION = this.useVersionPlaceholders ? 'JAVA_VERSION' : JAVA_VERSION;
        application.JAVA_COMPATIBLE_VERSIONS = JAVA_COMPATIBLE_VERSIONS;

        if (this.projectVersion) {
          this.log.info(`Using projectVersion: ${application.projectVersion}`);
          application.projectVersion = this.projectVersion;
        } else {
          application.projectVersion = '0.0.1-SNAPSHOT';
        }

        if (this.useVersionPlaceholders) {
          application.jhipsterDependenciesVersion = 'JHIPSTER_DEPENDENCIES_VERSION';
        } else if (this.jhipsterDependenciesVersion) {
          application.jhipsterDependenciesVersion = this.jhipsterDependenciesVersion;
          this.log.info(`Using jhipsterDependenciesVersion: ${application.jhipsterDependenciesVersion}`);
        } else {
          application.jhipsterDependenciesVersion = JHIPSTER_DEPENDENCIES_VERSION;
        }

        application.ANGULAR = ANGULAR;
        application.VUE = VUE;
        application.REACT = REACT;

        this.packagejs = packageJson;
        application.jhipsterPackageJson = packageJson;
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareForTemplates({ application }) {
        const SPRING_BOOT_VERSION = application.javaDependencies['spring-boot'];
        application.addSpringMilestoneRepository =
          ADD_SPRING_MILESTONE_REPOSITORY || SPRING_BOOT_VERSION.includes('M') || SPRING_BOOT_VERSION.includes('RC');

        // Application name modified, using each technology's conventions
        application.frontendAppName = this.getFrontendAppName(application.baseName);
        application.mainClass = this.getMainClassName(application.baseName);

        application.jhiTablePrefix = hibernateSnakeCase(application.jhiPrefix);

        application.mainJavaDir = SERVER_MAIN_SRC_DIR;
        application.mainJavaPackageDir = normalizePathEnd(`${SERVER_MAIN_SRC_DIR}${application.packageFolder}`);
        application.mainJavaResourceDir = SERVER_MAIN_RES_DIR;
        application.testJavaDir = SERVER_TEST_SRC_DIR;
        application.testJavaPackageDir = normalizePathEnd(`${SERVER_TEST_SRC_DIR}${application.packageFolder}`);
        application.testResourceDir = SERVER_TEST_RES_DIR;
        application.srcMainDir = MAIN_DIR;
        application.srcTestDir = TEST_DIR;
      },
      registerSpringFactory({ source, application }) {
        // We need a flag so we can recreate the file.
        let testSpringFactoryCreated = false;
        source.addTestSpringFactory = ({ key, value }) => {
          const springFactoriesFile = `${application.srcTestResources}META-INF/spring.factories`;
          if (!testSpringFactoryCreated) {
            testSpringFactoryCreated = true;
            this.writeDestination(springFactoriesFile, '');
          }
          this.editFile(springFactoriesFile, addSpringFactory({ key, value }));
        };
      },
      addLogNeedles({ source, application }) {
        source.addIntegrationTestAnnotation = ({ package: packageName, annotation }) =>
          this.editFile(this.destinationPath(`${application.javaPackageTestDir}IntegrationTest.java`), content =>
            addJavaAnnotation(content, { package: packageName, annotation })
          );
        source.addLogbackMainLog = ({ name, level }) =>
          this.editFile(
            this.destinationPath('src/main/resources/logback-spring.xml'),
            createNeedleCallback({
              needle: 'logback-add-log',
              contentToAdd: `<logger name="${name}" level="${level}"/>`,
            })
          );
        source.addLogbackTestLog = ({ name, level }) =>
          this.editFile(
            this.destinationPath('src/test/resources/logback.xml'),
            createNeedleCallback({
              needle: 'logback-add-log',
              contentToAdd: `<logger name="${name}" level="${level}"/>`,
            })
          );
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup(this.delegateTasksToBlueprint(() => this.preparing));
  }

  get configuringEachEntity() {
    return this.asConfiguringEachEntityTaskGroup({
      configureMicroservice({ application, entityConfig }) {
        if (application.applicationTypeMicroservice) {
          if (entityConfig.microserviceName === undefined) {
            entityConfig.microserviceName = application.baseName;
          }
          if (entityConfig.clientRootFolder === undefined) {
            entityConfig.clientRootFolder = entityConfig.microserviceName;
          }
          if (entityConfig.databaseType === undefined) {
            entityConfig.databaseType = application.databaseType;
          }
        }
      },
      configureGateway({ application, entityConfig }) {
        if (application.applicationTypeGateway) {
          if (entityConfig.databaseType === undefined) {
            entityConfig.databaseType = application.databaseType;
          }
          if (entityConfig.clientRootFolder === undefined) {
            entityConfig.clientRootFolder = entityConfig.clientRootFolder = entityConfig.skipUiGrouping
              ? ''
              : entityConfig.microserviceName;
          }
        }
      },
      configureEntitySearchEngine({ application, entityConfig }) {
        const { applicationTypeMicroservice, applicationTypeGateway, clientFrameworkAny } = application;
        if (entityConfig.microserviceName && !(applicationTypeMicroservice && clientFrameworkAny)) {
          if (!entityConfig.searchEngine) {
            // If a non-microfrontent microservice entity, should be disabled by default.
            entityConfig.searchEngine = NO_SEARCH_ENGINE;
          }
        }
        if (
          // Don't touch the configuration for microservice entities published at gateways
          !(applicationTypeGateway && entityConfig.microserviceName) &&
          !application.searchEngineAny &&
          !entityConfig.searchEngine
        ) {
          // Search engine can only be enabled at entity level and disabled at application level for gateways publishing a microservice entity
          entityConfig.searchEngine = NO_SEARCH_ENGINE;
          this.log.warn('Search engine is enabled at entity level, but disabled at application level. Search engine will be disabled');
        }
      },
      configureModelFiltering({ application, entityConfig }) {
        const { databaseTypeSql, applicationTypeGateway } = application;
        if (
          // Don't touch the configuration for microservice entities published at gateways
          !(applicationTypeGateway && entityConfig.microserviceName) &&
          entityConfig.jpaMetamodelFiltering &&
          (!databaseTypeSql || entityConfig.service === NO_SERVICE)
        ) {
          this.log.warn('Not compatible with jpaMetamodelFiltering, disabling');
          entityConfig.jpaMetamodelFiltering = false;
        }
      },
      configureEntityTable({ application, entityName, entityConfig, entityStorage }) {
        entityConfig.entityTableName = entityConfig.entityTableName || hibernateSnakeCase(entityName);

        const fixedEntityTableName = this._fixEntityTableName(
          entityConfig.entityTableName,
          entityConfig.prodDatabaseType ?? application.prodDatabaseType,
          application.jhiTablePrefix
        );
        if (fixedEntityTableName !== entityConfig.entityTableName) {
          entityConfig.entityTableName = fixedEntityTableName;
        }
        const validation = this._validateTableName(
          entityConfig.entityTableName,
          entityConfig.prodDatabaseType ?? application.prodDatabaseType,
          entityConfig
        );
        if (validation !== true) {
          throw new Error(validation);
        }

        // disable pagination if there is no database, unless it’s a microservice entity published by a gateway
        if (
          ![SQL, MONGODB, COUCHBASE, NEO4J].includes(entityConfig.databaseType ?? application.databaseType) &&
          (application.applicationType !== GATEWAY || !entityConfig.microserviceName)
        ) {
          entityConfig.pagination = NO_PAGINATION;
        }

        // Validate root entity json content
        if (entityConfig.changelogDate === undefined) {
          const currentDate = this.dateFormatForLiquibase();
          if (entityStorage.existed) {
            this.log.verboseInfo(`changelogDate is missing in .jhipster/${entityConfig.name}.json, using ${currentDate} as fallback`);
          }
          entityConfig.changelogDate = currentDate;
        }

        if (entityConfig.incrementalChangelog === undefined) {
          // Keep entity's original incrementalChangelog option.
          entityConfig.incrementalChangelog =
            this.jhipsterConfig.incrementalChangelog &&
            !existsSync(
              this.destinationPath(
                `src/main/resources/config/liquibase/changelog/${entityConfig.changelogDate}_added_entity_${entityConfig.name}.xml`
              )
            );
        }
      },

      configureFields({ application, entityConfig, entityName }) {
        const databaseType = entityConfig.databaseType ?? application.databaseType;
        // Validate entity json field content
        const fields = entityConfig.fields;
        fields.forEach(field => {
          // Migration from JodaTime to Java Time
          if (field.fieldType === 'DateTime' || field.fieldType === 'Date') {
            field.fieldType = INSTANT;
          }
          if (field.fieldType === BYTES && databaseType === CASSANDRA) {
            field.fieldType = BYTE_BUFFER;
          }

          this._validateField(entityName, field);

          if (field.fieldType === BYTE_BUFFER) {
            this.log.warn(
              `Cannot use validation in .jhipster/${entityName}.json for field ${stringifyApplicationData(
                field
              )} \nHibernate JPA 2 Metamodel does not work with Bean Validation 2 for LOB fields, so LOB validation is disabled`
            );
            field.fieldValidate = false;
            field.fieldValidateRules = [];
          }
          if (entityConfig.pagination && entityConfig.pagination !== NO_PAGINATION && isReservedPaginationWords(field.fieldName)) {
            throw new Error(
              `Field name '${field.fieldName}' found in ${entityConfig.name} is a reserved keyword, as it is used by Spring for pagination in the URL.`
            );
          }
          // Field type check should be ignored for entities of others microservices.
          if (!field.fieldValues && (!entityConfig.microserviceName || entityConfig.microserviceName === application.baseName)) {
            if (
              !Object.values(CommonDBTypes).includes(field.fieldType) &&
              (application.databaseType !== SQL || !Object.values(RelationalOnlyDBTypes).includes(field.fieldType))
            ) {
              throw new Error(
                `The type '${field.fieldType}' is an unknown field type for field '${field.fieldName}' of entity '${entityConfig.name}' using '${application.databaseType}' database.`
              );
            }
          }
        });
        entityConfig.fields = fields;
      },

      configureRelationships({ entityConfig, entityName }) {
        // Validate entity json relationship content
        const relationships = entityConfig.relationships;
        relationships.forEach(relationship => {
          this._validateRelationship(entityName, relationship);

          if (relationship.relationshipName === undefined) {
            relationship.relationshipName = relationship.otherEntityName;
            this.log.warn(
              `relationshipName is missing in .jhipster/${entityName}.json for relationship ${stringifyApplicationData(
                relationship
              )}, using ${relationship.otherEntityName} as fallback`
            );
          }
          if (relationship.useJPADerivedIdentifier) {
            this.log.verboseInfo('Option useJPADerivedIdentifier is deprecated, use id instead');
            relationship.id = true;
          }
        });
        entityConfig.relationships = relationships;
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.asConfiguringEachEntityTaskGroup(this.delegateTasksToBlueprint(() => this.configuringEachEntity));
  }

  /** @inheritdoc */
  get default() {
    return this.asDefaultTaskGroup({
      loadDomains({ application, entities }) {
        application.domains = [
          ...new Set([application.packageName, ...entities.map(entity => entity.entityAbsolutePackage).filter(Boolean)]),
        ];
      },

      insight({ application }) {
        statistics.sendSubGenEvent('generator', GENERATOR_SERVER, {
          app: {
            authenticationType: application.authenticationType,
            cacheProvider: application.cacheProvider,
            enableHibernateCache: application.enableHibernateCache,
            websocket: application.websocket,
            databaseType: application.databaseType,
            devDatabaseType: application.devDatabaseType,
            prodDatabaseType: application.prodDatabaseType,
            searchEngine: application.searchEngine,
            messageBroker: application.messageBroker,
            serviceDiscoveryType: application.serviceDiscoveryType,
            buildTool: application.buildTool,
            enableSwaggerCodegen: application.enableSwaggerCodegen,
            enableGradleEnterprise: application.enableGradleEnterprise,
          },
        });
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.asDefaultTaskGroup(this.delegateTasksToBlueprint(() => this.default));
  }

  /** @inheritdoc */
  get writing() {
    return this.asWritingTaskGroup({
      resetFakeDataSeed() {
        this.resetEntitiesFakeData('server');
      },
      ...writeFiles.call(this),
      async generateKeyStore({ application }) {
        const keyStoreFile = this.destinationPath(`${application.srcMainResources}config/tls/keystore.p12`);
        if (this.fakeKeytool) {
          this.writeDestination(keyStoreFile, 'fake key-tool');
        } else {
          this.validateResult(await generateKeyStore(keyStoreFile, { packageName: application.packageName }));
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.asWritingTaskGroup(this.delegateTasksToBlueprint(() => this.writing));
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      ...writeEntityFiles(),
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup(this.delegateTasksToBlueprint(() => this.writingEntities));
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addTestSpringFactory({ source, application }) {
        if (
          application.databaseTypeMongodb ||
          application.searchEngineElasticsearch ||
          application.databaseTypeCouchbase ||
          application.searchEngineCouchbase
        ) {
          source.addTestSpringFactory({
            key: 'org.springframework.test.context.ContextCustomizerFactory',
            value: `${application.packageName}.config.TestContainersSpringContextCustomizerFactory`,
          });
        }
      },
      customizeMaven({ application, source }) {
        if (!application.buildToolMaven) return;
        if (application.addSpringMilestoneRepository) {
          const springRepository = {
            id: 'spring-milestone',
            name: 'Spring Milestones',
            url: 'https://repo.spring.io/milestone',
          };
          source.addMavenPluginRepository?.(springRepository);
          source.addMavenRepository?.(springRepository);
          source.addMavenDependency?.({
            groupId: 'org.springframework.boot',
            artifactId: 'spring-boot-properties-migrator',
            scope: 'runtime',
          });
        }
        if (application.jhipsterDependenciesVersion.endsWith('-SNAPSHOT')) {
          source.addMavenRepository?.({
            id: 'ossrh-snapshots',
            url: 'https://oss.sonatype.org/content/repositories/snapshots/',
            releasesEnabled: false,
          });
        }
      },
      packageJsonScripts({ application }) {
        const packageJsonConfigStorage = this.packageJson.createStorage('config').createProxy();
        packageJsonConfigStorage.backend_port = application.gatewayServerPort || application.serverPort;
        packageJsonConfigStorage.packaging = application.defaultPackaging;
        packageJsonConfigStorage.default_environment = application.defaultEnvironment;
      },
      packageJsonBackendScripts() {
        const scriptsStorage = this.packageJson.createStorage('scripts');
        const javaCommonLog = `-Dlogging.level.ROOT=OFF -Dlogging.level.tech.jhipster=OFF -Dlogging.level.${this.jhipsterConfig.packageName}=OFF`;
        const javaTestLog =
          '-Dlogging.level.org.springframework=OFF -Dlogging.level.org.springframework.web=OFF -Dlogging.level.org.springframework.security=OFF';

        const buildTool = this.jhipsterConfig.buildTool;
        let e2ePackage = 'target/e2e';
        if (buildTool === MAVEN) {
          const excludeWebapp = this.jhipsterConfig.skipClient ? '' : ' -Dskip.installnodenpm -Dskip.npm';
          scriptsStorage.set({
            'app:start': './mvnw',
            'backend:info': './mvnw -ntp enforcer:display-info --batch-mode',
            'backend:doc:test': './mvnw -ntp javadoc:javadoc --batch-mode',
            'backend:nohttp:test': './mvnw -ntp checkstyle:check --batch-mode',
            'backend:start': `./mvnw${excludeWebapp}`,
            'java:jar': './mvnw -ntp verify -DskipTests --batch-mode',
            'java:war': './mvnw -ntp verify -DskipTests --batch-mode -Pwar',
            'java:docker': './mvnw -ntp verify -DskipTests -Pprod jib:dockerBuild',
            'java:docker:arm64': 'npm run java:docker -- -Djib-maven-plugin.architecture=arm64',
            'backend:unit:test': `./mvnw -ntp${excludeWebapp} verify --batch-mode ${javaCommonLog} ${javaTestLog}`,
            'backend:build-cache': './mvnw dependency:go-offline',
            'backend:debug': './mvnw -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:8000"',
          });
        } else if (buildTool === GRADLE) {
          const excludeWebapp = this.jhipsterConfig.skipClient ? '' : '-x webapp -x webapp_test';
          e2ePackage = 'e2e';
          scriptsStorage.set({
            'app:start': './gradlew',
            'backend:info': './gradlew -v',
            'backend:doc:test': `./gradlew javadoc ${excludeWebapp}`,
            'backend:nohttp:test': `./gradlew checkstyleNohttp ${excludeWebapp}`,
            'backend:start': `./gradlew ${excludeWebapp}`,
            'java:jar': './gradlew bootJar -x test -x integrationTest',
            'java:war': './gradlew bootWar -Pwar -x test -x integrationTest',
            'java:docker': './gradlew bootJar -Pprod jibDockerBuild',
            'java:docker:arm64': 'npm run java:docker -- -PjibArchitecture=arm64',
            'backend:unit:test': `./gradlew test integrationTest ${excludeWebapp} ${javaCommonLog} ${javaTestLog}`,
            'postci:e2e:package': 'cp build/libs/*.$npm_package_config_packaging e2e.$npm_package_config_packaging',
            'backend:build-cache': 'npm run backend:info && npm run backend:nohttp:test && npm run ci:e2e:package',
          });
        }

        scriptsStorage.set({
          'java:jar:dev': 'npm run java:jar -- -Pdev,webapp',
          'java:jar:prod': 'npm run java:jar -- -Pprod',
          'java:war:dev': 'npm run java:war -- -Pdev,webapp',
          'java:war:prod': 'npm run java:war -- -Pprod',
          'java:docker:dev': 'npm run java:docker -- -Pdev,webapp',
          'java:docker:prod': 'npm run java:docker -- -Pprod',
          'ci:backend:test':
            'npm run backend:info && npm run backend:doc:test && npm run backend:nohttp:test && npm run backend:unit:test -- -P$npm_package_config_default_environment',
          'ci:e2e:package':
            'npm run java:$npm_package_config_packaging:$npm_package_config_default_environment -- -Pe2e -Denforcer.skip=true',
          'preci:e2e:server:start': 'npm run services:db:await --if-present && npm run services:others:await --if-present',
          'ci:e2e:server:start': `java -jar ${e2ePackage}.$npm_package_config_packaging --spring.profiles.active=e2e,$npm_package_config_default_environment ${javaCommonLog} ${javaTestLog} --logging.level.org.springframework.web=ERROR`,
        });
      },
      packageJsonE2eScripts({ application }) {
        const scriptsStorage = this.packageJson.createStorage('scripts');
        const buildCmd = this.jhipsterConfig.buildTool === GRADLE ? 'gradlew' : 'mvnw';
        // TODO add e2eTests property to application.
        if (this.jhipsterConfig.testFrameworks?.includes('cypress')) {
          const applicationWaitTimeout = WAIT_TIMEOUT * (application.applicationTypeGateway ? 2 : 1);
          const applicationEndpoint = application.applicationTypeMicroservice
            ? `http-get://localhost:${application.gatewayServerPort}/${application.endpointPrefix}/management/health/readiness`
            : 'http-get://localhost:$npm_package_config_backend_port/management/health';

          scriptsStorage.set({
            'ci:server:await': `echo "Waiting for server at port $npm_package_config_backend_port to start" && wait-on -t ${applicationWaitTimeout} ${applicationEndpoint} && echo "Server at port $npm_package_config_backend_port started"`,
            'pree2e:headless': 'npm run ci:server:await',
            'ci:e2e:run': 'concurrently -k -s first "npm run ci:e2e:server:start" "npm run e2e:headless"',
            'e2e:dev': `concurrently -k -s first "./${buildCmd}" "npm run e2e"`,
            'e2e:devserver': `concurrently -k -s first "npm run backend:start" "npm start" "wait-on -t ${WAIT_TIMEOUT} http-get://localhost:9000 && npm run e2e:headless -- -c baseUrl=http://localhost:9000"`,
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateTasksToBlueprint(() => this.postWriting));
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      packageJsonE2eScripts({ application, entities }) {
        if (application.applicationTypeGateway) {
          const { serverPort, lowercaseBaseName } = application;
          const microservices = [...new Set(entities.map(entity => entity.microserviceName))].filter(Boolean).map(ms => ms.toLowerCase());
          const scriptsStorage = this.packageJson.createStorage('scripts');
          const waitServices = microservices
            .concat(lowercaseBaseName)
            .map(ms => `npm run ci:server:await:${ms}`)
            .join(' && ');

          scriptsStorage.set({
            [`ci:server:await:${lowercaseBaseName}`]: `wait-on -t ${WAIT_TIMEOUT} http-get://localhost:$npm_package_config_backend_port/management/health`,
            ...Object.fromEntries(
              microservices.map(ms => [
                `ci:server:await:${ms}`,
                `wait-on -t ${WAIT_TIMEOUT} http-get://localhost:${serverPort}/services/${ms}/management/health/readiness`,
              ])
            ),
            'ci:server:await': `echo "Waiting for services to start" && ${waitServices} && echo "Services started"`,
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.asPostWritingEntitiesTaskGroup(this.delegateTasksToBlueprint(() => this.postWritingEntities));
  }

  get end() {
    return this.asEndTaskGroup({
      end({ application }) {
        this.log.ok('Spring Boot application generated successfully.');

        let executable = 'mvnw';
        if (application.buildTool === GRADLE) {
          executable = 'gradlew';
        }
        let logMsgComment = '';
        if (os.platform() === 'win32') {
          logMsgComment = ` (${chalk.yellow.bold(executable)} if using Windows Command Prompt)`;
        }
        this.log.log(chalk.green(`  Run your Spring Boot application:\n  ${chalk.yellow.bold(`./${executable}`)}${logMsgComment}`));
      },
    });
  }

  get [BaseApplicationGenerator.END]() {
    return this.asEndTaskGroup(this.delegateTasksToBlueprint(() => this.end));
  }

  _configureServer(config = this.jhipsterConfigWithDefaults, dest = this.jhipsterConfig) {
    // JWT authentication is mandatory with Eureka, so the JHipster Registry
    // can control the applications
    if (config.serviceDiscoveryType === EUREKA && config.authenticationType !== OAUTH2) {
      dest.authenticationType = JWT;
    }

    // Generate JWT secret key if key does not already exist in config
    if (
      (config.authenticationType === JWT || config.applicationType === MICROSERVICE || config.applicationType === GATEWAY) &&
      config.jwtSecretKey === undefined
    ) {
      dest.jwtSecretKey = createBase64Secret(64, this.options.reproducibleTests);
    }
    // Generate remember me key if key does not already exist in config
    if (config.authenticationType === SESSION && !dest.rememberMeKey) {
      dest.rememberMeKey = createSecret();
    }

    if (config.authenticationType === OAUTH2) {
      dest.skipUserManagement = true;
    }

    if (config.enableHibernateCache && [NO_CACHE, MEMCACHED].includes(config.cacheProvider)) {
      this.log.verboseInfo(`Disabling hibernate cache for cache provider ${config.cacheProvider}`);
      dest.enableHibernateCache = false;
    }

    if (!config.databaseType && config.prodDatabaseType) {
      dest.databaseType = getDBTypeFromDBValue(config.prodDatabaseType);
    }
    if (!config.devDatabaseType && config.prodDatabaseType) {
      dest.devDatabaseType = config.prodDatabaseType;
    }

    // force variables unused by microservice applications
    if (config.applicationType === MICROSERVICE) {
      dest.websocket = NO_WEBSOCKET;
    }
    const databaseType = config.databaseType;
    if (databaseType === NO_DATABASE) {
      dest.devDatabaseType = NO_DATABASE;
      dest.prodDatabaseType = NO_DATABASE;
      dest.enableHibernateCache = false;
      dest.skipUserManagement = true;
    } else if ([MONGODB, NEO4J, COUCHBASE, CASSANDRA].includes(databaseType)) {
      dest.devDatabaseType = databaseType;
      dest.prodDatabaseType = databaseType;
      dest.enableHibernateCache = false;
    }
  }

  /**
   * Validate the entityTableName
   * @return {true|string} true for a valid value or error message.
   */
  _validateTableName(entityTableName, prodDatabaseType, entity) {
    const jhiTablePrefix = entity.jhiTablePrefix;
    const instructions = `You can specify a different table name in your JDL file or change it in .jhipster/${entity.name}.json file and then run again 'jhipster entity ${entity.name}.'`;

    if (!/^([a-zA-Z0-9_]*)$/.test(entityTableName)) {
      return `The table name cannot contain special characters.\n${instructions}`;
    }
    if (!entityTableName) {
      return 'The table name cannot be empty';
    }
    if (isReservedTableName(entityTableName, prodDatabaseType)) {
      if (jhiTablePrefix) {
        this.log.warn(
          `The table name cannot contain the '${entityTableName.toUpperCase()}' reserved keyword, so it will be prefixed with '${jhiTablePrefix}_'.\n${instructions}`
        );
        entity.entityTableName = `${jhiTablePrefix}_${entityTableName}`;
      } else {
        this.log.warn(
          `The table name contain the '${entityTableName.toUpperCase()}' reserved keyword but you have defined an empty jhiPrefix so it won't be prefixed and thus the generated application might not work'.\n${instructions}`
        );
      }
    }
    return true;
  }

  _validateField(entityName, field) {
    if (field.fieldName === undefined) {
      throw new Error(`fieldName is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`);
    }

    if (field.fieldType === undefined) {
      throw new Error(`fieldType is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`);
    }

    if (field.fieldValidateRules !== undefined) {
      if (!Array.isArray(field.fieldValidateRules)) {
        throw new Error(`fieldValidateRules is not an array in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`);
      }
      field.fieldValidateRules.forEach(fieldValidateRule => {
        if (!SUPPORTED_VALIDATION_RULES.includes(fieldValidateRule)) {
          throw new Error(
            `fieldValidateRules contains unknown validation rule ${fieldValidateRule} in .jhipster/${entityName}.json for field ${stringifyApplicationData(
              field
            )} [supported validation rules ${SUPPORTED_VALIDATION_RULES}]`
          );
        }
      });
      if (field.fieldValidateRules.includes(MAX) && field.fieldValidateRulesMax === undefined) {
        throw new Error(`fieldValidateRulesMax is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`);
      }
      if (field.fieldValidateRules.includes(MIN) && field.fieldValidateRulesMin === undefined) {
        throw new Error(`fieldValidateRulesMin is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`);
      }
      if (field.fieldValidateRules.includes(MAXLENGTH) && field.fieldValidateRulesMaxlength === undefined) {
        throw new Error(
          `fieldValidateRulesMaxlength is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`
        );
      }
      if (field.fieldValidateRules.includes(MINLENGTH) && field.fieldValidateRulesMinlength === undefined) {
        throw new Error(
          `fieldValidateRulesMinlength is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`
        );
      }
      if (field.fieldValidateRules.includes(MAXBYTES) && field.fieldValidateRulesMaxbytes === undefined) {
        throw new Error(
          `fieldValidateRulesMaxbytes is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`
        );
      }
      if (field.fieldValidateRules.includes(MINBYTES) && field.fieldValidateRulesMinbytes === undefined) {
        throw new Error(
          `fieldValidateRulesMinbytes is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`
        );
      }
      if (field.fieldValidateRules.includes(PATTERN) && field.fieldValidateRulesPattern === undefined) {
        throw new Error(
          `fieldValidateRulesPattern is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`
        );
      }
    }
  }

  _validateRelationship(entityName, relationship) {
    if (relationship.otherEntityName === undefined) {
      throw new Error(
        `otherEntityName is missing in .jhipster/${entityName}.json for relationship ${stringifyApplicationData(relationship)}`
      );
    }
    if (relationship.relationshipType === undefined) {
      throw new Error(
        `relationshipType is missing in .jhipster/${entityName}.json for relationship ${stringifyApplicationData(relationship)}`
      );
    }

    if (
      relationship.ownerSide === undefined &&
      (relationship.relationshipType === 'one-to-one' || relationship.relationshipType === 'many-to-many')
    ) {
      throw new Error(`ownerSide is missing in .jhipster/${entityName}.json for relationship ${stringifyApplicationData(relationship)}`);
    }
  }

  _fixEntityTableName(entityTableName, prodDatabaseType, jhiTablePrefix) {
    if (isReservedTableName(entityTableName, prodDatabaseType) && jhiTablePrefix) {
      entityTableName = `${jhiTablePrefix}_${entityTableName}`;
    }
    return entityTableName;
  }

  /**
   * @private
   * Format As Field Javadoc
   *
   * @param {string} text - text to format
   * @returns field javadoc
   */
  formatAsFieldJavadoc(text) {
    return formatDocAsJavaDoc(text, 4);
  }

  /**
   * @private
   * Format As Api Description
   *
   * @param {string} text - text to format
   * @returns formatted api description
   */
  formatAsApiDescription(text) {
    return formatDocAsApiDescription(text);
  }

  /**
   * @private
   * Format As Class Javadoc
   *
   * @param {string} text - text to format
   * @returns class javadoc
   */
  formatAsClassJavadoc(text) {
    return formatDocAsJavaDoc(text, 0);
  }

  /**
   * @private
   * Return the method name which converts the filter to specification
   * @param {string} fieldType
   */
  getSpecificationBuilder(fieldType) {
    if (
      [
        TYPE_INTEGER,
        TYPE_LONG,
        TYPE_FLOAT,
        TYPE_DOUBLE,
        TYPE_BIG_DECIMAL,
        TYPE_LOCAL_DATE,
        TYPE_ZONED_DATE_TIME,
        TYPE_INSTANT,
        TYPE_DURATION,
      ].includes(fieldType)
    ) {
      return 'buildRangeSpecification';
    }
    if (fieldType === TYPE_STRING) {
      return 'buildStringSpecification';
    }
    return 'buildSpecification';
  }

  getJavaValueGeneratorForType(type) {
    return getJavaValueForType(type);
  }

  /**
   * @private
   * Returns the primary key value based on the primary key type, DB and default value
   *
   * @param {string} primaryKey - the primary key type
   * @param {string} databaseType - the database type
   * @param {string} defaultValue - default value
   * @returns {string} java primary key value
   */
  getPrimaryKeyValue(primaryKey, databaseType = this.jhipsterConfig.databaseType, defaultValue = 1) {
    return getPKValue(primaryKey, databaseType, defaultValue);
  }

  /**
   * @private
   * Convert to Java bean name case
   *
   * Handle the specific case when the second letter is capitalized
   * See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
   *
   * @param {string} beanName name of the class to check
   * @return {string}
   */
  javaBeanCase(beanName) {
    return javaBeanClassNameFormat(beanName);
  }

  buildJavaGet(reference) {
    return javaGetCall(reference);
  }

  buildJavaGetter(reference, type = reference.type) {
    return javaGetter(reference, type);
  }

  buildJavaSetter(reference, valueDefinition = `${reference.type} ${reference.name}`) {
    return javaSetter(reference, valueDefinition);
  }
}
