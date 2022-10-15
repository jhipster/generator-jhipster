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

/* eslint-disable consistent-return */
const { existsSync } = require('fs');
const chalk = require('chalk');
const os = require('os');
const prompts = require('./prompts.cjs');
const { isReservedTableName } = require('../../jdl/jhipster/reserved-keywords');
const {
  GENERATOR_COMMON,
  GENERATOR_LANGUAGES,
  GENERATOR_SERVER,
  GENERATOR_BOOTSTRAP_APPLICATION,
  GENERATOR_DATABASE_CHANGELOG,
} = require('../generator-list.cjs');
const databaseTypes = require('../../jdl/jhipster/database-types');
const BaseApplicationGenerator = require('../base-application/generator.cjs');
const { writeFiles } = require('./files.cjs');
const { writeFiles: writeEntityFiles, customizeFiles } = require('./entity-files.cjs');
const { packageJson: packagejs } = require('../../lib/index.cjs');
const constants = require('../generator-constants.cjs');
const statistics = require('../statistics.cjs');
const { defaultConfig } = require('../generator-defaults.cjs');
const { JWT, OAUTH2, SESSION } = require('../../jdl/jhipster/authentication-types');

const { GRADLE, MAVEN } = require('../../jdl/jhipster/build-tool-types');
const { ELASTICSEARCH } = require('../../jdl/jhipster/search-engine-types');
const { EUREKA } = require('../../jdl/jhipster/service-discovery-types');
const applicationTypes = require('../../jdl/jhipster/application-types');
const { getBase64Secret, getRandomHex } = require('../utils.cjs');
const cacheTypes = require('../../jdl/jhipster/cache-types');
const websocketTypes = require('../../jdl/jhipster/websocket-types');
const fieldTypes = require('../../jdl/jhipster/field-types');
const entityOptions = require('../../jdl/jhipster/entity-options');
const validations = require('../../jdl/jhipster/validations');
const { stringify } = require('../../utils/index.cjs');

const { CAFFEINE, EHCACHE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS, NO: NO_CACHE } = cacheTypes;
const { FALSE: NO_WEBSOCKET } = websocketTypes;
const { CASSANDRA, COUCHBASE, ORACLE, MONGODB, NEO4J, SQL, NO: NO_DATABASE } = databaseTypes;
const { MICROSERVICE, GATEWAY } = applicationTypes;

const { SERVER_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR, SERVER_TEST_SRC_DIR, SERVER_TEST_RES_DIR, MAIN_DIR, TEST_DIR } = constants;
const { CommonDBTypes, RelationalOnlyDBTypes } = fieldTypes;
const { INSTANT } = CommonDBTypes;
const { BYTES, BYTE_BUFFER } = RelationalOnlyDBTypes;
const { PaginationTypes, ServiceTypes } = entityOptions;
const { MAX, MIN, MAXLENGTH, MINLENGTH, MAXBYTES, MINBYTES, PATTERN } = validations;

const WAIT_TIMEOUT = 3 * 60000;
const { NO: NO_PAGINATION } = PaginationTypes;
const { NO: NO_SERVICE } = ServiceTypes;

const { SUPPORTED_VALIDATION_RULES } = constants;

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../bootstrap-application-server/types').SpringBootApplication>}
 */
module.exports = class JHipsterServerGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });

    // This adds support for a `--experimental` flag which can be used to enable experimental features
    this.option('experimental', {
      desc: 'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
      type: Boolean,
    });

    if (this.options.help) {
      return;
    }

    this.loadStoredAppOptions();
    this.loadRuntimeOptions();

    // preserve old jhipsterVersion value for cleanup which occurs after new config is written into disk
    this.jhipsterOldVersion = this.jhipsterConfig.jhipsterVersion;
  }

  async _postConstruct() {
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
    return this.asInitialingTaskGroup({
      displayLogo() {
        if (this.logo) {
          this.printJHipsterLogo();
        }
      },

      setupRequiredConfig() {
        if (!this.jhipsterConfig.applicationType) {
          this.jhipsterConfig.applicationType = defaultConfig.applicationType;
        }
      },

      verifyExistingProject() {
        const serverConfigFound =
          this.jhipsterConfig.packageName !== undefined &&
          this.jhipsterConfig.authenticationType !== undefined &&
          this.jhipsterConfig.cacheProvider !== undefined &&
          this.jhipsterConfig.websocket !== undefined &&
          this.jhipsterConfig.databaseType !== undefined &&
          this.jhipsterConfig.devDatabaseType !== undefined &&
          this.jhipsterConfig.prodDatabaseType !== undefined &&
          this.jhipsterConfig.searchEngine !== undefined &&
          this.jhipsterConfig.buildTool !== undefined;

        if (this.jhipsterConfig.baseName !== undefined && serverConfigFound) {
          this.log(
            chalk.green('This is an existing project, using the configuration from your .yo-rc.json file \nto re-generate the project...\n')
          );

          this.existingProject = true;
        }
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.asInitialingTaskGroup(this.delegateToBlueprint ? {} : this.initializing);
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      askForModuleName: prompts.askForModuleName,
      askForServerSideOpts: prompts.askForServerSideOpts,
      askForOptionalItems: prompts.askForOptionalItems,
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
    return this.asConfiguringTaskGroup(this.delegateToBlueprint ? {} : this.configuring);
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composeCommon() {
        await this.composeWithJHipster(GENERATOR_COMMON);
      },

      async composeLanguages() {
        // We don't expose client/server to cli, composing with languages is used for test purposes.
        if (this.jhipsterConfig.enableTranslation === false) return;
        await this.composeWithJHipster(GENERATOR_LANGUAGES);
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.asComposingTaskGroup(this.delegateToBlueprint ? {} : this.composing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      loadEnvironmentVariables({ application }) {
        if (process.env.JHI_BOM_VERSION) {
          application.jhiBomVersion = process.env.JHI_BOM_VERSION;
          this.info(`Using JHipster BOM version ${process.env.JHI_BOM_VERSION}`);
        }

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

      setupServerconsts({ application }) {
        // Make constants available in templates
        application.MAIN_DIR = constants.MAIN_DIR;
        application.TEST_DIR = constants.TEST_DIR;
        application.DOCKER_DIR = constants.DOCKER_DIR;
        application.LOGIN_REGEX = constants.LOGIN_REGEX;
        application.CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;
        application.SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
        application.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
        application.SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
        application.SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;

        application.DOCKER_JHIPSTER_REGISTRY = constants.DOCKER_JHIPSTER_REGISTRY;
        application.DOCKER_JHIPSTER_CONTROL_CENTER = constants.DOCKER_JHIPSTER_CONTROL_CENTER;
        application.DOCKER_JAVA_JRE = constants.DOCKER_JAVA_JRE;
        application.DOCKER_MYSQL = constants.DOCKER_MYSQL;
        application.DOCKER_MARIADB = constants.DOCKER_MARIADB;
        application.DOCKER_MONGODB = constants.DOCKER_MONGODB;
        application.DOCKER_COUCHBASE = constants.DOCKER_COUCHBASE;
        application.DOCKER_MSSQL = constants.DOCKER_MSSQL;
        application.DOCKER_NEO4J = constants.DOCKER_NEO4J;
        application.DOCKER_HAZELCAST_MANAGEMENT_CENTER = constants.DOCKER_HAZELCAST_MANAGEMENT_CENTER;
        application.DOCKER_MEMCACHED = constants.DOCKER_MEMCACHED;
        application.DOCKER_REDIS = constants.DOCKER_REDIS;
        application.DOCKER_CASSANDRA = constants.DOCKER_CASSANDRA;
        application.DOCKER_KAFKA = constants.DOCKER_KAFKA;
        application.KAFKA_VERSION = constants.KAFKA_VERSION;
        application.DOCKER_ZOOKEEPER = constants.DOCKER_ZOOKEEPER;
        application.DOCKER_SONAR = constants.DOCKER_SONAR;
        application.DOCKER_CONSUL = constants.DOCKER_CONSUL;
        application.DOCKER_CONSUL_CONFIG_LOADER = constants.DOCKER_CONSUL_CONFIG_LOADER;
        application.DOCKER_SWAGGER_EDITOR = constants.DOCKER_SWAGGER_EDITOR;
        application.DOCKER_PROMETHEUS = constants.DOCKER_PROMETHEUS;
        application.DOCKER_GRAFANA = constants.DOCKER_GRAFANA;
        application.DOCKER_ZIPKIN = constants.DOCKER_ZIPKIN;

        application.JAVA_VERSION = constants.JAVA_VERSION;
        application.JAVA_COMPATIBLE_VERSIONS = constants.JAVA_COMPATIBLE_VERSIONS;
        application.GRADLE_VERSION = constants.GRADLE_VERSION;

        application.NODE_VERSION = constants.NODE_VERSION;
        application.NPM_VERSION = constants.NPM_VERSION;

        application.JHIPSTER_DEPENDENCIES_VERSION = application.jhiBomVersion || constants.JHIPSTER_DEPENDENCIES_VERSION;
        application.SPRING_BOOT_VERSION = constants.SPRING_BOOT_VERSION;
        application.HIBERNATE_VERSION = constants.HIBERNATE_VERSION;
        application.JACKSON_DATABIND_NULLABLE_VERSION = constants.JACKSON_DATABIND_NULLABLE_VERSION;
        application.JACOCO_VERSION = constants.JACOCO_VERSION;

        application.ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
        application.VUE = constants.SUPPORTED_CLIENT_FRAMEWORKS.VUE;
        application.REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;

        this.packagejs = packagejs;
        application.jhipsterPackageJson = packagejs;
      },

      setSharedConfigOptions({ application }) {
        // Make dist dir available in templates
        application.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.jhipsterConfig.buildTool);
        application.CLIENT_DIST_DIR = this.getResourceBuildDirectoryForBuildTool(this.jhipsterConfig.buildTool) + constants.CLIENT_DIST_DIR;
      },

      prepareForTemplates({ application }) {
        // Application name modified, using each technology's conventions
        application.frontendAppName = this.getFrontendAppName(application.baseName);
        application.mainClass = this.getMainClassName(application.baseName);
        application.cacheManagerIsAvailable = [EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS].includes(
          application.cacheProvider
        );
        application.testsNeedCsrf = [OAUTH2, SESSION].includes(application.authenticationType);

        application.jhiTablePrefix = this.getTableName(application.jhiPrefix);

        application.mainJavaDir = SERVER_MAIN_SRC_DIR;
        application.mainJavaPackageDir = `${SERVER_MAIN_SRC_DIR}${application.packageFolder}/`;
        application.mainJavaResourceDir = SERVER_MAIN_RES_DIR;
        application.testJavaDir = SERVER_TEST_SRC_DIR;
        application.testJavaPackageDir = `${SERVER_TEST_SRC_DIR}${application.packageFolder}/`;
        application.testResourceDir = SERVER_TEST_RES_DIR;
        application.srcMainDir = MAIN_DIR;
        application.srcTestDir = TEST_DIR;

        application.builtInUser = this.isUsingBuiltInUser();
        application.builtInAuthority = this.isUsingBuiltInAuthority();
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup(this.delegateToBlueprint ? {} : this.preparing);
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
          if (entityConfig.searchEngine === undefined) {
            // If a non-microfrontent microservice entity, should be disabled by default.
            entityConfig.searchEngine = false;
          }
        }
        if (
          // Don't touch the configuration for microservice entities published at gateways
          !(applicationTypeGateway && entityConfig.microserviceName) &&
          !application.searchEngineAny &&
          ![undefined, false, 'no'].includes(entityConfig.searchEngine)
        ) {
          // Search engine can only be enabled at entity level and disabled at application level for gateways publishing a microservice entity
          entityConfig.searchEngine = false;
          this.warning('Search engine is enabled at entity level, but disabled at application level. Search engine will be disabled');
        }
      },
      configureModelFiltering({ application, entityConfig }) {
        const { databaseTypeSql, applicationTypeGateway, reactive } = application;
        if (
          // Don't touch the configuration for microservice entities published at gateways
          !(applicationTypeGateway && entityConfig.microserviceName) &&
          entityConfig.jpaMetamodelFiltering &&
          (!databaseTypeSql || entityConfig.service === NO_SERVICE || reactive)
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
    return this.asConfiguringEachEntityTaskGroup(this.delegateToBlueprint ? {} : this.configuringEachEntity);
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
    return this.asDefaultTaskGroup(this.delegateToBlueprint ? {} : this.default);
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
    return this.asWritingTaskGroup(this.delegateToBlueprint ? {} : this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      ...writeEntityFiles(),

      async databaseChangelog({ application, entities }) {
        if (!application.databaseTypeSql || this.options.skipDbChangelog) {
          return;
        }
        const filteredEntities = entities.filter(entity => !entity.builtIn && !entity.skipServer);
        if (filteredEntities.length === 0) {
          return;
        }
        await this.composeWithJHipster(
          GENERATOR_DATABASE_CHANGELOG,
          filteredEntities.map(entity => entity.name)
        );
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup(this.delegateToBlueprint ? {} : this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      async dockerServices({ application }) {
        const { createDockerComposeFile, createDockerExtendedServices } = await import('../base-docker/utils.mjs');

        const dockerFile = createDockerComposeFile(application.lowercaseBaseName);
        this.writeDestination(`${application.dockerServicesDir}services.yml`, dockerFile);

        if (application.databaseTypeCouchbase) {
          const extendedCouchbaseServices = createDockerExtendedServices({ serviceName: application.databaseType });
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedCouchbaseServices);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedCouchbaseServices);
        }

        if (application.databaseTypeSql && !application.prodDatabaseTypeOracle) {
          const extendedDatabaseServices = createDockerExtendedServices({ serviceName: application.prodDatabaseType });
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedDatabaseServices);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedDatabaseServices);
        }

        if (application.databaseTypeCassandra) {
          const extendedCassandraServices = createDockerExtendedServices(
            { serviceName: 'cassandra' },
            { serviceFile: './cassandra.yml', serviceName: 'cassandra-migration' }
          );
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedCassandraServices);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedCassandraServices);
        } else if (!application.databaseTypeSql && !application.databaseTypeCouchbase) {
          const extendedDatabaseServices = createDockerExtendedServices({ serviceName: application.databaseType });
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedDatabaseServices);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedDatabaseServices);
        }
        if (application.searchEngineElasticsearch) {
          const extendedElasticsearchServices = createDockerExtendedServices({ serviceName: application.searchEngine });
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedElasticsearchServices);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedElasticsearchServices);
        }
        if (application.cacheProviderMemcached || application.cacheProviderRedis) {
          const extendedCacheProviderServices = createDockerExtendedServices({ serviceName: application.cacheProvider });
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedCacheProviderServices);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedCacheProviderServices);
        }
        if (application.authenticationTypeOauth2) {
          const extendedOauth2Services = createDockerExtendedServices({ serviceName: 'keycloak' });
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedOauth2Services);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedOauth2Services);
        }
        if (application.serviceDiscoveryEureka) {
          const extendedEurekaServices = createDockerExtendedServices({
            serviceName: 'jhipster-registry',
            additionalConfig: {
              environment: [application.authenticationTypeOauth2 ? 'JHIPSTER_SLEEP=40' : 'JHIPSTER_SLEEP=20'],
            },
          });

          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedEurekaServices);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedEurekaServices);
        }
        if (application.serviceDiscoveryConsul) {
          const extendedConsulServices = createDockerExtendedServices(
            { serviceName: 'consul' },
            { serviceFile: './consul.yml', serviceName: 'consul-config-loader' }
          );
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedConsulServices);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedConsulServices);
        }
        if (application.messageBrokerKafka) {
          const extendedKafkaServices = createDockerExtendedServices(
            { serviceName: 'kafka' },
            { serviceFile: './kafka.yml', serviceName: 'zookeeper' }
          );
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedKafkaServices);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedKafkaServices);
        }
      },
      packageJsonScripts({ application }) {
        const packageJsonConfigStorage = this.packageJson.createStorage('config').createProxy();
        packageJsonConfigStorage.backend_port = application.gatewayServerPort || application.serverPort;
        packageJsonConfigStorage.packaging = application.defaultPackaging;
        packageJsonConfigStorage.default_environment = application.defaultEnvironment;
      },
      packageJsonDockerScripts({ application }) {
        const scriptsStorage = this.packageJson.createStorage('scripts');
        const { databaseType, prodDatabaseType } = this.jhipsterConfig;
        const { databaseTypeSql, prodDatabaseTypeMysql, authenticationTypeOauth2, applicationTypeMicroservice } = application;
        const dockerAwaitScripts = [];
        if (databaseTypeSql) {
          if (prodDatabaseTypeMysql) {
            scriptsStorage.set({
              'docker:db:await': `echo "Waiting for MySQL to start" && wait-on -t ${WAIT_TIMEOUT} tcp:3306 && sleep 20 && echo "MySQL started"`,
            });
          }
          if (prodDatabaseType === NO_DATABASE || prodDatabaseType === ORACLE) {
            scriptsStorage.set(
              'docker:db:up',
              `echo "Docker for db ${prodDatabaseType} not configured for application ${application.baseName}"`
            );
          } else {
            scriptsStorage.set({
              'docker:db:up': `docker compose -f src/main/docker/${prodDatabaseType}.yml up -d`,
              'docker:db:down': `docker compose -f src/main/docker/${prodDatabaseType}.yml down -v`,
            });
          }
        } else {
          const dockerFile = `src/main/docker/${databaseType}.yml`;
          if (databaseType === CASSANDRA) {
            scriptsStorage.set({
              'docker:db:await': `wait-on -t ${WAIT_TIMEOUT} tcp:9042 && sleep 20`,
            });
          }
          if (databaseType === COUCHBASE) {
            scriptsStorage.set({
              'docker:db:await': `echo "Waiting for Couchbase to start" && wait-on -t ${WAIT_TIMEOUT} http-get://localhost:8091/ui/index.html && sleep 30 && echo "Couchbase started"`,
            });
          }
          if (databaseType === COUCHBASE || databaseType === CASSANDRA) {
            scriptsStorage.set({
              'docker:db:build': `docker compose -f ${dockerFile} build`,
              'docker:db:up': `docker compose -f ${dockerFile} up -d`,
              'docker:db:down': `docker compose -f ${dockerFile} down -v`,
            });
          } else if (this.fs.exists(this.destinationPath(dockerFile))) {
            scriptsStorage.set({
              'docker:db:up': `docker compose -f ${dockerFile} up -d`,
              'docker:db:down': `docker compose -f ${dockerFile} down -v`,
            });
          } else {
            scriptsStorage.set(
              'docker:db:up',
              `echo "Docker for db ${databaseType} not configured for application ${application.baseName}"`
            );
          }
        }
        if (this.jhipsterConfig.searchEngine === ELASTICSEARCH) {
          dockerAwaitScripts.push(
            `echo "Waiting for Elasticsearch to start" && wait-on -t ${WAIT_TIMEOUT} "http-get://localhost:9200/_cluster/health?wait_for_status=green&timeout=60s" && echo "Elasticsearch started"`
          );
        }

        const dockerOthersUp = [];
        const dockerOthersDown = [];
        const dockerBuild = [];
        ['keycloak', 'elasticsearch', 'kafka', 'consul', 'redis', 'memcached', 'jhipster-registry'].forEach(dockerConfig => {
          const dockerFile = `src/main/docker/${dockerConfig}.yml`;
          if (this.fs.exists(this.destinationPath(dockerFile))) {
            if (['cassandra', 'couchbase'].includes(dockerConfig)) {
              scriptsStorage.set(`docker:${dockerConfig}:build`, `docker compose -f ${dockerFile} build`);
              dockerBuild.push(`npm run docker:${dockerConfig}:build`);
            } else if (dockerConfig === 'jhipster-registry') {
              if (authenticationTypeOauth2 && !applicationTypeMicroservice) {
                dockerOthersUp.push('npm run docker:keycloak:await');
              }
              scriptsStorage.set(
                'docker:jhipster-registry:await',
                `echo "Waiting for jhipster-registry to start" && wait-on -t ${WAIT_TIMEOUT} http-get://localhost:8761/management/health && echo "jhipster-registry started"`
              );
              dockerAwaitScripts.push('npm run docker:jhipster-registry:await');
            } else if (dockerConfig === 'keycloak') {
              scriptsStorage.set(
                'docker:keycloak:await',
                `echo "Waiting for keycloak to start" && wait-on -t ${WAIT_TIMEOUT} http-get://localhost:9080/realms/jhipster && echo "keycloak started" || echo "keycloak not running, make sure oauth2 server is running"`
              );
              dockerAwaitScripts.push('npm run docker:keycloak:await');
            }

            scriptsStorage.set(`docker:${dockerConfig}:up`, `docker compose -f ${dockerFile} up -d`);
            dockerOthersUp.push(`npm run docker:${dockerConfig}:up`);
            scriptsStorage.set(`docker:${dockerConfig}:down`, `docker compose -f ${dockerFile} down -v`);
            dockerOthersDown.push(`npm run docker:${dockerConfig}:down`);
          }
        });
        scriptsStorage.set({
          'docker:app:up': `docker compose -f ${application.DOCKER_DIR}app.yml up -d`,
          'docker:others:await': dockerAwaitScripts.join(' && '),
          'predocker:others:up': dockerBuild.join(' && '),
          'docker:others:up': dockerOthersUp.join(' && '),
          'docker:others:down': dockerOthersDown.join(' && '),
          'ci:e2e:prepare:docker': 'docker compose -f src/main/docker/services.yml up -d && docker ps -a',
          'ci:e2e:prepare': 'npm run ci:e2e:prepare:docker',
          'ci:e2e:teardown:docker': 'docker compose -f src/main/docker/services.yml down -v && docker ps -a',
          'ci:e2e:teardown': 'npm run ci:e2e:teardown:docker',
        });
      },
      packageJsonBackendScripts() {
        const scriptsStorage = this.packageJson.createStorage('scripts');
        const javaCommonLog = `-Dlogging.level.ROOT=OFF -Dlogging.level.org.zalando=OFF -Dlogging.level.tech.jhipster=OFF -Dlogging.level.${this.jhipsterConfig.packageName}=OFF`;
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
          'preci:e2e:server:start': 'npm run docker:db:await --if-present && npm run docker:others:await --if-present',
          'ci:e2e:server:start': `java -jar ${e2ePackage}.$npm_package_config_packaging --spring.profiles.active=e2e,$npm_package_config_default_environment ${javaCommonLog} ${javaTestLog} --logging.level.org.springframework.web=ERROR`,
        });
      },
      packageJsonE2eScripts({ application }) {
        const scriptsStorage = this.packageJson.createStorage('scripts');
        const buildCmd = this.jhipsterConfig.buildTool === GRADLE ? 'gradlew' : 'mvnw';
        if (scriptsStorage.get('e2e')) {
          const applicationWaitTimeout = WAIT_TIMEOUT * (application.applicationTypeGateway ? 2 : 1);
          scriptsStorage.set({
            'ci:server:await': `echo "Waiting for server at port $npm_package_config_backend_port to start" && wait-on -t ${applicationWaitTimeout} http-get://localhost:$npm_package_config_backend_port/management/health && echo "Server at port $npm_package_config_backend_port started"`,
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
    return this.asPostWritingTaskGroup(this.delegateToBlueprint ? {} : this.postWriting);
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      customizeFiles,
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.asPostWritingEntitiesTaskGroup(this.delegateToBlueprint ? {} : this.postWritingEntities);
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
    return this.asEndTaskGroup(this.delegateToBlueprint ? {} : this.end);
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
      config.jwtSecretKey = getBase64Secret.call(this, null, 64);
    }
    // Generate remember me key if key does not already exist in config
    if (config.authenticationType === SESSION && !config.rememberMeKey) {
      config.rememberMeKey = getRandomHex();
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
};
