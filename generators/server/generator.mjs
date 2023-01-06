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

import serverOptions from './options.mjs';
import { askForOptionalItems, askForServerSideOpts } from './prompts.mjs';
import {
  GENERATOR_BOOTSTRAP_APPLICATION,
  GENERATOR_COMMON,
  GENERATOR_COUCHBASE,
  GENERATOR_DOCKER,
  GENERATOR_ELASTICSEARCH,
  GENERATOR_GRADLE,
  GENERATOR_KAFKA,
  GENERATOR_LANGUAGES,
  GENERATOR_LIQUIBASE,
  GENERATOR_MAVEN,
  GENERATOR_MONGODB,
  GENERATOR_SERVER,
} from '../generator-list.mjs';
import BaseApplicationGenerator from '../base-application/index.mjs';
import { writeFiles } from './files.mjs';
import { writeFiles as writeEntityFiles, customizeFiles } from './entity-files.mjs';

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
  JHIPSTER_DEPENDENCIES_VERSION,
  SPRING_BOOT_VERSION,
  JAVA_VERSION,
  JAVA_COMPATIBLE_VERSIONS,
  SPRING_CLOUD_VERSION,
  HIBERNATE_VERSION,
  CASSANDRA_DRIVER_VERSION,
  JACKSON_DATABIND_NULLABLE_VERSION,
  JACOCO_VERSION,
} from '../generator-constants.mjs';
import statistics from '../statistics.cjs';

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
} from '../../jdl/jhipster/index.mjs';
import { stringify } from '../../utils/index.mjs';
import { createBase64Secret, createSecret } from '../../lib/utils/secret-utils.mjs';
import checkJava from './support/checks/check-java.mjs';
import { normalizePathEnd } from '../base/utils.mjs';

const { SUPPORTED_VALIDATION_RULES } = validations;
const { isReservedTableName } = reservedKeywords;
const { ANGULAR, REACT, VUE } = clientFrameworkTypes;
const { JWT, OAUTH2, SESSION } = authenticationTypes;
const { GRADLE, MAVEN } = buildToolTypes;
const { EUREKA } = serviceDiscoveryTypes;
const { CAFFEINE, EHCACHE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS, NO: NO_CACHE } = cacheTypes;
const NO_WEBSOCKET = websocketTypes.NO;
const { CASSANDRA, COUCHBASE, MONGODB, NEO4J, SQL, NO: NO_DATABASE } = databaseTypes;
const { MICROSERVICE, GATEWAY } = applicationTypes;
const { KAFKA } = messageBrokerTypes;

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
 * @extends {BaseApplicationGenerator<import('./types.mjs').SpringBootApplication>}
 */
export default class JHipsterServerGenerator extends BaseApplicationGenerator {
  /** @type {string} */
  jhipsterDependenciesVersion;
  /** @type {string} */
  projectVersion;

  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });

    // This adds support for a `--experimental` flag which can be used to enable experimental features
    this.option('experimental', {
      desc: 'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
      type: Boolean,
    });
    this.jhipsterOptions(serverOptions);

    if (this.options.help) {
      return;
    }

    this.loadStoredAppOptions();
    this.loadRuntimeOptions();

    // preserve old jhipsterVersion value for cleanup which occurs after new config is written into disk
    this.jhipsterOldVersion = this.jhipsterConfig.jhipsterVersion;
  }

  async beforeQueue() {
    // TODO depend on GENERATOR_BOOTSTRAP_APPLICATION_SERVER.
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
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

          try {
            await this.spawnCommand('./npmw', ['install'], { preferLocal: true });
          } catch (error) {
            this.log(chalk.red(`Error executing './npmw install', execute it yourself. (${error.shortMessage})`));
          }
          return true;
        }.bind(this),
      });
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      displayLogo() {
        if (this.logo) {
          this.printJHipsterLogo();
        }
      },

      validateJava() {
        if (!this.options.skipChecks) {
          this.checkJava();
        }
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
    const shouldSkipPrompting = this.delegateToBlueprint || this.options.defaults;
    return this.asPromptingTaskGroup(shouldSkipPrompting ? {} : this.prompting);
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
            this.warning('Non reactive gateway is not supported. Switching to reactive.');
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
      async composeCommon() {
        await this.composeWithJHipster(GENERATOR_COMMON);
      },

      async composing() {
        const { buildTool, enableTranslation, databaseType, messageBroker, searchEngine } = this.jhipsterConfigWithDefaults;
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
          await this.composeWithJHipster(GENERATOR_LIQUIBASE);
        } else if (databaseType === COUCHBASE) {
          await this.composeWithJHipster(GENERATOR_COUCHBASE);
        } else if (databaseType === MONGODB) {
          await this.composeWithJHipster(GENERATOR_MONGODB);
        }
        if (messageBroker === KAFKA) {
          await this.composeWithJHipster(GENERATOR_KAFKA);
        }
        if (searchEngine === ELASTICSEARCH) {
          await this.composeWithJHipster(GENERATOR_ELASTICSEARCH);
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.asComposingTaskGroup(this.delegateTasksToBlueprint(() => this.composing));
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      loadEnvironmentVariables({ application }) {
        application.defaultPackaging = process.env.JHI_WAR === '1' ? 'war' : 'jar';
        if (application.defaultPackaging === 'war') {
          this.info(`Using ${application.defaultPackaging} as default packaging`);
        }

        const JHI_PROFILE = process.env.JHI_PROFILE;
        application.defaultEnvironment = (JHI_PROFILE || '').includes('dev') ? 'dev' : 'prod';
        if (JHI_PROFILE) {
          this.info(`Using ${application.defaultEnvironment} as default profile`);
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

        application.JAVA_VERSION = control.useVersionPlaceholders ? 'JAVA_VERSION' : JAVA_VERSION;
        application.JAVA_COMPATIBLE_VERSIONS = JAVA_COMPATIBLE_VERSIONS;

        if (this.projectVersion) {
          this.info(`Using projectVersion: ${application.jhipsterDependenciesVersion}`);
          application.projectVersion = this.projectVersion;
        } else {
          application.projectVersion = '0.0.1-SNAPSHOT';
        }

        if (control.useVersionPlaceholders) {
          application.jhipsterDependenciesVersion = 'JHIPSTER_DEPENDENCIES_VERSION';
        } else if (this.jhipsterDependenciesVersion) {
          application.jhipsterDependenciesVersion = this.jhipsterDependenciesVersion;
          this.info(`Using jhipsterDependenciesVersion: ${application.jhipsterDependenciesVersion}`);
        } else {
          application.jhipsterDependenciesVersion = JHIPSTER_DEPENDENCIES_VERSION;
        }
        application.SPRING_BOOT_VERSION = control.useVersionPlaceholders ? 'SPRING_BOOT_VERSION' : SPRING_BOOT_VERSION;
        application.SPRING_CLOUD_VERSION = control.useVersionPlaceholders ? 'SPRING_CLOUD_VERSION' : SPRING_CLOUD_VERSION;
        application.HIBERNATE_VERSION = control.useVersionPlaceholders ? 'HIBERNATE_VERSION' : HIBERNATE_VERSION;
        application.CASSANDRA_DRIVER_VERSION = control.useVersionPlaceholders ? 'CASSANDRA_DRIVER_VERSION' : CASSANDRA_DRIVER_VERSION;
        application.JACKSON_DATABIND_NULLABLE_VERSION = control.useVersionPlaceholders
          ? 'JACKSON_DATABIND_NULLABLE_VERSION'
          : JACKSON_DATABIND_NULLABLE_VERSION;
        application.JACOCO_VERSION = control.useVersionPlaceholders ? 'JACOCO_VERSION' : JACOCO_VERSION;

        application.ANGULAR = ANGULAR;
        application.VUE = VUE;
        application.REACT = REACT;

        this.packagejs = packageJson;
        application.jhipsterPackageJson = packageJson;
      },

      prepareForTemplates({ application }) {
        // Application name modified, using each technology's conventions
        application.frontendAppName = this.getFrontendAppName(application.baseName);
        application.mainClass = this.getMainClassName(application.baseName);
        application.cacheManagerIsAvailable = [EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS].includes(
          application.cacheProvider
        );
        application.authenticationUsesCsrf = [OAUTH2, SESSION].includes(application.authenticationType);

        application.jhiTablePrefix = this.getTableName(application.jhiPrefix);

        application.mainJavaDir = SERVER_MAIN_SRC_DIR;
        application.mainJavaPackageDir = normalizePathEnd(`${SERVER_MAIN_SRC_DIR}${application.packageFolder}`);
        application.mainJavaResourceDir = SERVER_MAIN_RES_DIR;
        application.testJavaDir = SERVER_TEST_SRC_DIR;
        application.testJavaPackageDir = normalizePathEnd(`${SERVER_TEST_SRC_DIR}${application.packageFolder}`);
        application.testResourceDir = SERVER_TEST_RES_DIR;
        application.srcMainDir = MAIN_DIR;
        application.srcTestDir = TEST_DIR;
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
          this.warning('Search engine is enabled at entity level, but disabled at application level. Search engine will be disabled');
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
          this.warning('Not compatible with jpaMetamodelFiltering, disabling');
          entityConfig.jpaMetamodelFiltering = false;
        }
      },
      configureEntityTable({ application, entityName, entityConfig, entityStorage }) {
        entityConfig.entityTableName = entityConfig.entityTableName || this.getTableName(entityName);

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
            this.info(`changelogDate is missing in .jhipster/${entityConfig.name}.json, using ${currentDate} as fallback`);
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
            this.warning(
              `Cannot use validation in .jhipster/${entityName}.json for field ${stringify(
                field
              )} \nHibernate JPA 2 Metamodel does not work with Bean Validation 2 for LOB fields, so LOB validation is disabled`
            );
            field.validation = false;
            field.fieldValidateRules = [];
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
            this.warning(
              `relationshipName is missing in .jhipster/${entityName}.json for relationship ${stringify(relationship)}, using ${
                relationship.otherEntityName
              } as fallback`
            );
          }
          if (relationship.useJPADerivedIdentifier) {
            this.info('Option useJPADerivedIdentifier is deprecated, use id instead');
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
        if (scriptsStorage.get('e2e')) {
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
      customizeFiles,

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
      checkLocaleValue({ application }) {
        if (application.languages && application.languages.includes('in')) {
          this.warning(
            "For jdk 17 compatibility 'in' locale value should set 'java.locale.useOldISOCodes=true' environment variable. Refer to https://bugs.openjdk.java.net/browse/JDK-8267069"
          );
        }
      },

      end({ application }) {
        this.log(chalk.green.bold('\nServer application generated successfully.\n'));

        let executable = 'mvnw';
        if (application.buildTool === GRADLE) {
          executable = 'gradlew';
        }
        let logMsgComment = '';
        if (os.platform() === 'win32') {
          logMsgComment = ` (${chalk.yellow.bold(executable)} if using Windows Command Prompt)`;
        }
        this.log(chalk.green(`Run your Spring Boot application:\n${chalk.yellow.bold(`./${executable}`)}${logMsgComment}`));
      },
    });
  }

  get [BaseApplicationGenerator.END]() {
    return this.asEndTaskGroup(this.delegateTasksToBlueprint(() => this.end));
  }

  _configureServer(config = this.jhipsterConfig) {
    // JWT authentication is mandatory with Eureka, so the JHipster Registry
    // can control the applications
    if (config.serviceDiscoveryType === EUREKA && config.authenticationType !== OAUTH2) {
      config.authenticationType = JWT;
    }

    // Generate JWT secret key if key does not already exist in config
    if (
      (config.authenticationType === JWT || config.applicationType === MICROSERVICE || config.applicationType === GATEWAY) &&
      config.jwtSecretKey === undefined
    ) {
      config.jwtSecretKey = createBase64Secret.call(this, null, 64);
    }
    // Generate remember me key if key does not already exist in config
    if (config.authenticationType === SESSION && !config.rememberMeKey) {
      config.rememberMeKey = createSecret();
    }

    if (config.authenticationType === OAUTH2) {
      config.skipUserManagement = true;
    }

    if (config.enableHibernateCache && [NO_CACHE, MEMCACHED].includes(config.cacheProvider)) {
      this.info(`Disabling hibernate cache for cache provider ${config.cacheProvider}`);
      config.enableHibernateCache = false;
    }

    if (!config.databaseType && config.prodDatabaseType) {
      config.databaseType = this.getDBTypeFromDBValue(config.prodDatabaseType);
    }
    if (!config.devDatabaseType && config.prodDatabaseType) {
      config.devDatabaseType = config.prodDatabaseType;
    }

    // force variables unused by microservice applications
    if (config.applicationType === MICROSERVICE) {
      config.websocket = NO_WEBSOCKET;
    }
    const databaseType = config.databaseType;
    if (databaseType === NO_DATABASE) {
      config.devDatabaseType = NO_DATABASE;
      config.prodDatabaseType = NO_DATABASE;
      config.enableHibernateCache = false;
      config.skipUserManagement = true;
    } else if ([MONGODB, NEO4J, COUCHBASE, CASSANDRA].includes(databaseType)) {
      config.devDatabaseType = databaseType;
      config.prodDatabaseType = databaseType;
      config.enableHibernateCache = false;
    }
  }

  /**
   * Check if a supported Java is installed
   *
   * Blueprints can customize or disable java checks versions by overriding this method.
   * @example
   * // disable checks
   * checkJava() {}
   * @examples
   * // enforce java lts versions
   * checkJava() {
   *   super.checkJava(['8', '11', '17'], { throwOnError: true });
   * }
   */
  checkJava(javaCompatibleVersions = JAVA_COMPATIBLE_VERSIONS, checkResultValidation) {
    this.validateCheckResult(checkJava(javaCompatibleVersions), { throwOnError: false, ...checkResultValidation });
  }

  _generateSqlSafeName(name) {
    if (isReservedTableName(name, SQL)) {
      return `e_${name}`;
    }
    return name;
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
        this.warning(
          `The table name cannot contain the '${entityTableName.toUpperCase()}' reserved keyword, so it will be prefixed with '${jhiTablePrefix}_'.\n${instructions}`
        );
        entity.entityTableName = `${jhiTablePrefix}_${entityTableName}`;
      } else {
        this.warning(
          `The table name contain the '${entityTableName.toUpperCase()}' reserved keyword but you have defined an empty jhiPrefix so it won't be prefixed and thus the generated application might not work'.\n${instructions}`
        );
      }
    }
    return true;
  }

  _validateField(entityName, field) {
    if (field.fieldName === undefined) {
      throw new Error(`fieldName is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
    }

    if (field.fieldType === undefined) {
      throw new Error(`fieldType is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
    }

    if (field.fieldValidateRules !== undefined) {
      if (!Array.isArray(field.fieldValidateRules)) {
        throw new Error(`fieldValidateRules is not an array in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
      field.fieldValidateRules.forEach(fieldValidateRule => {
        if (!SUPPORTED_VALIDATION_RULES.includes(fieldValidateRule)) {
          throw new Error(
            `fieldValidateRules contains unknown validation rule ${fieldValidateRule} in .jhipster/${entityName}.json for field ${stringify(
              field
            )} [supported validation rules ${SUPPORTED_VALIDATION_RULES}]`
          );
        }
      });
      if (field.fieldValidateRules.includes(MAX) && field.fieldValidateRulesMax === undefined) {
        throw new Error(`fieldValidateRulesMax is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
      if (field.fieldValidateRules.includes(MIN) && field.fieldValidateRulesMin === undefined) {
        throw new Error(`fieldValidateRulesMin is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
      if (field.fieldValidateRules.includes(MAXLENGTH) && field.fieldValidateRulesMaxlength === undefined) {
        throw new Error(`fieldValidateRulesMaxlength is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
      if (field.fieldValidateRules.includes(MINLENGTH) && field.fieldValidateRulesMinlength === undefined) {
        throw new Error(`fieldValidateRulesMinlength is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
      if (field.fieldValidateRules.includes(MAXBYTES) && field.fieldValidateRulesMaxbytes === undefined) {
        throw new Error(`fieldValidateRulesMaxbytes is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
      if (field.fieldValidateRules.includes(MINBYTES) && field.fieldValidateRulesMinbytes === undefined) {
        throw new Error(`fieldValidateRulesMinbytes is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
      if (field.fieldValidateRules.includes(PATTERN) && field.fieldValidateRulesPattern === undefined) {
        throw new Error(`fieldValidateRulesPattern is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
      }
    }
  }

  _validateRelationship(entityName, relationship) {
    if (relationship.otherEntityName === undefined) {
      throw new Error(`otherEntityName is missing in .jhipster/${entityName}.json for relationship ${stringify(relationship)}`);
    }
    if (relationship.relationshipType === undefined) {
      throw new Error(`relationshipType is missing in .jhipster/${entityName}.json for relationship ${stringify(relationship)}`);
    }

    if (
      relationship.ownerSide === undefined &&
      (relationship.relationshipType === 'one-to-one' || relationship.relationshipType === 'many-to-many')
    ) {
      throw new Error(`ownerSide is missing in .jhipster/${entityName}.json for relationship ${stringify(relationship)}`);
    }
  }

  _fixEntityTableName(entityTableName, prodDatabaseType, jhiTablePrefix) {
    if (isReservedTableName(entityTableName, prodDatabaseType) && jhiTablePrefix) {
      entityTableName = `${jhiTablePrefix}_${entityTableName}`;
    }
    return entityTableName;
  }
}
