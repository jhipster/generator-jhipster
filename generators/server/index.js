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
const chalk = require('chalk');
const os = require('os');
const prompts = require('./prompts');
const { GENERATOR_COMMON, GENERATOR_LANGUAGES, GENERATOR_SERVER } = require('../generator-list');
const databaseTypes = require('../../jdl/jhipster/database-types');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { writeFiles } = require('./files');
const packagejs = require('../../package.json');
const constants = require('../generator-constants');
const statistics = require('../statistics');
const { defaultConfig } = require('../generator-defaults');
const { JWT, OAUTH2, SESSION } = require('../../jdl/jhipster/authentication-types');

const { CASSANDRA, COUCHBASE, ORACLE, MONGODB, NEO4J } = require('../../jdl/jhipster/database-types');
const { CAFFEINE, EHCACHE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS } = require('../../jdl/jhipster/cache-types');
const { GRADLE, MAVEN } = require('../../jdl/jhipster/build-tool-types');
const { ELASTICSEARCH } = require('../../jdl/jhipster/search-engine-types');
const { EUREKA } = require('../../jdl/jhipster/service-discovery-types');
const { MICROSERVICE, GATEWAY } = require('../../jdl/jhipster/application-types');
const { getBase64Secret, getRandomHex } = require('../utils');
const cacheTypes = require('../../jdl/jhipster/cache-types');
const websocketTypes = require('../../jdl/jhipster/websocket-types');
const {
  INITIALIZING_PRIORITY,
  PROMPTING_PRIORITY,
  CONFIGURING_PRIORITY,
  COMPOSING_PRIORITY,
  LOADING_PRIORITY,
  PREPARING_PRIORITY,
  DEFAULT_PRIORITY,
  WRITING_PRIORITY,
  POST_WRITING_PRIORITY,
  END_PRIORITY,
} = require('../../lib/constants/priorities.cjs').compat;

const NO_CACHE = cacheTypes.NO;
const NO_DATABASE = databaseTypes.NO;
const NO_WEBSOCKET = websocketTypes.FALSE;

const { SERVER_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR, SERVER_TEST_SRC_DIR, SERVER_TEST_RES_DIR, MAIN_DIR, TEST_DIR } = constants;

const WAIT_TIMEOUT = 3 * 60000;

module.exports = class JHipsterServerGenerator extends BaseBlueprintGenerator {
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

  // Public API method used by the getter and also by Blueprints
  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },

      displayLogo() {
        if (this.logo) {
          this.printJHipsterLogo();
        }
      },

      loadEnvironmentVariables() {
        if (process.env.JHI_BOM_VERSION) {
          this.jhiBomVersion = process.env.JHI_BOM_VERSION;
          this.info(`Using JHipster BOM version ${process.env.JHI_BOM_VERSION}`);
        }

        this.defaultPackaging = process.env.JHI_WAR === '1' ? 'war' : 'jar';
        if (this.defaultPackaging === 'war') {
          this.info(`Using ${this.defaultPackaging} as default packaging`);
        }

        const JHI_PROFILE = process.env.JHI_PROFILE;
        this.defaultEnvironment = (JHI_PROFILE || '').includes('dev') ? 'dev' : 'prod';
        if (JHI_PROFILE) {
          this.info(`Using ${this.defaultEnvironment} as default profile`);
        }
      },

      setupServerconsts() {
        // Make constants available in templates
        this.MAIN_DIR = constants.MAIN_DIR;
        this.TEST_DIR = constants.TEST_DIR;
        this.DOCKER_DIR = constants.DOCKER_DIR;
        this.LOGIN_REGEX = constants.LOGIN_REGEX;
        this.CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;
        this.SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
        this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
        this.SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
        this.SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;

        this.DOCKER_JHIPSTER_REGISTRY = constants.DOCKER_JHIPSTER_REGISTRY;
        this.DOCKER_JHIPSTER_CONTROL_CENTER = constants.DOCKER_JHIPSTER_CONTROL_CENTER;
        this.DOCKER_JAVA_JRE = constants.DOCKER_JAVA_JRE;
        this.DOCKER_MYSQL = constants.DOCKER_MYSQL;
        this.DOCKER_MARIADB = constants.DOCKER_MARIADB;
        this.DOCKER_POSTGRESQL = constants.DOCKER_POSTGRESQL;
        this.DOCKER_MONGODB = constants.DOCKER_MONGODB;
        this.DOCKER_COUCHBASE = constants.DOCKER_COUCHBASE;
        this.DOCKER_MSSQL = constants.DOCKER_MSSQL;
        this.DOCKER_NEO4J = constants.DOCKER_NEO4J;
        this.DOCKER_HAZELCAST_MANAGEMENT_CENTER = constants.DOCKER_HAZELCAST_MANAGEMENT_CENTER;
        this.DOCKER_MEMCACHED = constants.DOCKER_MEMCACHED;
        this.DOCKER_REDIS = constants.DOCKER_REDIS;
        this.DOCKER_CASSANDRA = constants.DOCKER_CASSANDRA;
        this.DOCKER_ELASTICSEARCH = constants.DOCKER_ELASTICSEARCH;
        this.DOCKER_ELASTICSEARCH_CONTAINER = constants.DOCKER_ELASTICSEARCH_CONTAINER;
        this.ELASTICSEARCH_VERSION = constants.ELASTICSEARCH_VERSION;
        this.DOCKER_KEYCLOAK = constants.DOCKER_KEYCLOAK;
        this.DOCKER_KEYCLOAK_VERSION = constants.DOCKER_KEYCLOAK_VERSION;
        this.DOCKER_KAFKA = constants.DOCKER_KAFKA;
        this.KAFKA_VERSION = constants.KAFKA_VERSION;
        this.DOCKER_ZOOKEEPER = constants.DOCKER_ZOOKEEPER;
        this.DOCKER_SONAR = constants.DOCKER_SONAR;
        this.DOCKER_CONSUL = constants.DOCKER_CONSUL;
        this.DOCKER_CONSUL_CONFIG_LOADER = constants.DOCKER_CONSUL_CONFIG_LOADER;
        this.DOCKER_SWAGGER_EDITOR = constants.DOCKER_SWAGGER_EDITOR;
        this.DOCKER_PROMETHEUS = constants.DOCKER_PROMETHEUS;
        this.DOCKER_GRAFANA = constants.DOCKER_GRAFANA;
        this.DOCKER_COMPOSE_FORMAT_VERSION = constants.DOCKER_COMPOSE_FORMAT_VERSION;
        this.DOCKER_ZIPKIN = constants.DOCKER_ZIPKIN;

        this.JAVA_VERSION = constants.JAVA_VERSION;
        this.JAVA_COMPATIBLE_VERSIONS = constants.JAVA_COMPATIBLE_VERSIONS;
        this.GRADLE_VERSION = constants.GRADLE_VERSION;

        this.NODE_VERSION = constants.NODE_VERSION;
        this.NPM_VERSION = constants.NPM_VERSION;

        this.JHIPSTER_DEPENDENCIES_VERSION = this.jhiBomVersion || constants.JHIPSTER_DEPENDENCIES_VERSION;
        this.SPRING_BOOT_VERSION = constants.SPRING_BOOT_VERSION;
        this.LIQUIBASE_VERSION = constants.LIQUIBASE_VERSION;
        // TODO v8: Remove this constant
        this.LIQUIBASE_DTD_VERSION = constants.LIQUIBASE_DTD_VERSION;
        this.HIBERNATE_VERSION = constants.HIBERNATE_VERSION;
        this.JACKSON_DATABIND_NULLABLE_VERSION = constants.JACKSON_DATABIND_NULLABLE_VERSION;
        this.JACOCO_VERSION = constants.JACOCO_VERSION;
        this.JIB_VERSION = constants.JIB_VERSION;

        this.ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
        this.VUE = constants.SUPPORTED_CLIENT_FRAMEWORKS.VUE;
        this.REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;

        this.packagejs = packagejs;
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
    };
  }

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._initializing();
  }

  /** @inheritdoc */
  _prompting() {
    return {
      askForModuleName: prompts.askForModuleName,
      askForServerSideOpts: prompts.askForServerSideOpts,
      askForOptionalItems: prompts.askForOptionalItems,

      setSharedConfigOptions() {
        // Make dist dir available in templates
        this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.jhipsterConfig.buildTool);
        this.CLIENT_DIST_DIR = this.getResourceBuildDirectoryForBuildTool(this.jhipsterConfig.buildTool) + constants.CLIENT_DIST_DIR;
      },
    };
  }

  get [PROMPTING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._prompting();
  }

  /** @inheritdoc */
  _configuring() {
    return {
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
    };
  }

  get [CONFIGURING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._configuring();
  }

  /** @inheritdoc */
  _composing() {
    return {
      async composeCommon() {
        await this.composeWithJHipster(GENERATOR_COMMON, true);
      },

      async composeLanguages() {
        // We don't expose client/server to cli, composing with languages is used for test purposes.
        if (this.jhipsterConfig.enableTranslation === false) return;
        await this.composeWithJHipster(GENERATOR_LANGUAGES, true);
      },
    };
  }

  get [COMPOSING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._composing();
  }

  /** @inheritdoc */
  _loading() {
    return {
      loadSharedConfig() {
        this.loadAppConfig();
        this.loadDerivedAppConfig();
        this.loadClientConfig();
        this.loadDerivedClientConfig();
        this.loadServerConfig();
        this.loadPlatformConfig();
        this.loadTranslationConfig();
      },
    };
  }

  get [LOADING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._loading();
  }

  /** @inheritdoc */
  _preparing() {
    return {
      prepareForTemplates() {
        // Application name modified, using each technology's conventions
        this.frontendAppName = this.getFrontendAppName();
        this.mainClass = this.getMainClassName();
        this.cacheManagerIsAvailable = [EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS].includes(this.cacheProvider);
        this.testsNeedCsrf = [OAUTH2, SESSION].includes(this.authenticationType);

        this.jhiTablePrefix = this.getTableName(this.jhiPrefix);

        this.mainJavaDir = SERVER_MAIN_SRC_DIR;
        this.mainJavaPackageDir = `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/`;
        this.mainJavaResourceDir = SERVER_MAIN_RES_DIR;
        this.testJavaDir = SERVER_TEST_SRC_DIR;
        this.testJavaPackageDir = `${SERVER_TEST_SRC_DIR}${this.packageFolder}/`;
        this.testResourceDir = SERVER_TEST_RES_DIR;
        this.srcMainDir = MAIN_DIR;
        this.srcTestDir = TEST_DIR;
      },
    };
  }

  get [PREPARING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._preparing();
  }

  /** @inheritdoc */
  _default() {
    return {
      ...super._missingPreDefault(),

      loadUserManagementEntities() {
        // TODO v8 move to preparingEntities priority.
        if (!this.configOptions.sharedEntities) return;
        // Make user entity available to templates.
        this.user = this.configOptions.sharedEntities.User;
      },

      loadDomains() {
        if (!this.configOptions.sharedEntities) return;
        this.domains = [
          ...new Set([
            this.packageName,
            ...Object.values(this.configOptions.sharedEntities)
              .map(entity => entity.entityAbsolutePackage)
              .filter(packageName => packageName),
          ]),
        ];
      },

      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_SERVER, {
          app: {
            authenticationType: this.authenticationType,
            cacheProvider: this.cacheProvider,
            enableHibernateCache: this.enableHibernateCache,
            websocket: this.websocket,
            databaseType: this.databaseType,
            devDatabaseType: this.devDatabaseType,
            prodDatabaseType: this.prodDatabaseType,
            searchEngine: this.searchEngine,
            messageBroker: this.messageBroker,
            serviceDiscoveryType: this.serviceDiscoveryType,
            buildTool: this.buildTool,
            enableSwaggerCodegen: this.enableSwaggerCodegen,
            enableGradleEnterprise: this.enableGradleEnterprise,
          },
        });
      },
    };
  }

  get [DEFAULT_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._default();
  }

  /** @inheritdoc */
  _writing() {
    return {
      ...writeFiles(),
      ...super._missingPostWriting(),
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }

  /** @inheritdoc */
  _postWriting() {
    return {
      packageJsonScripts() {
        const packageJsonConfigStorage = this.packageJson.createStorage('config').createProxy();
        packageJsonConfigStorage.backend_port = this.gatewayServerPort || this.serverPort;
        packageJsonConfigStorage.packaging = this.defaultPackaging;
        packageJsonConfigStorage.default_environment = this.defaultEnvironment;
      },
      packageJsonDockerScripts() {
        const scriptsStorage = this.packageJson.createStorage('scripts');
        const { databaseType, prodDatabaseType } = this.jhipsterConfig;
        const { databaseTypeSql, prodDatabaseTypeMysql, authenticationTypeOauth2, applicationTypeMicroservice } = this;
        const dockerAwaitScripts = [];
        if (databaseTypeSql) {
          if (prodDatabaseTypeMysql) {
            scriptsStorage.set({
              'docker:db:await': `echo "Waiting for MySQL to start" && wait-on -t ${WAIT_TIMEOUT} tcp:3306 && sleep 20 && echo "MySQL started"`,
            });
          }
          if (prodDatabaseType === NO_DATABASE || prodDatabaseType === ORACLE) {
            scriptsStorage.set('docker:db:up', `echo "Docker for db ${prodDatabaseType} not configured for application ${this.baseName}"`);
          } else {
            scriptsStorage.set({
              'docker:db:up': `docker-compose -f src/main/docker/${prodDatabaseType}.yml up -d`,
              'docker:db:down': `docker-compose -f src/main/docker/${prodDatabaseType}.yml down -v`,
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
              'docker:db:build': `docker-compose -f ${dockerFile} build`,
              'docker:db:up': `docker-compose -f ${dockerFile} up -d`,
              'docker:db:down': `docker-compose -f ${dockerFile} down -v`,
            });
          } else if (this.fs.exists(this.destinationPath(dockerFile))) {
            scriptsStorage.set({
              'docker:db:up': `docker-compose -f ${dockerFile} up -d`,
              'docker:db:down': `docker-compose -f ${dockerFile} down -v`,
            });
          } else {
            scriptsStorage.set('docker:db:up', `echo "Docker for db ${databaseType} not configured for application ${this.baseName}"`);
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
              scriptsStorage.set(`docker:${dockerConfig}:build`, `docker-compose -f ${dockerFile} build`);
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

            scriptsStorage.set(`docker:${dockerConfig}:up`, `docker-compose -f ${dockerFile} up -d`);
            dockerOthersUp.push(`npm run docker:${dockerConfig}:up`);
            scriptsStorage.set(`docker:${dockerConfig}:down`, `docker-compose -f ${dockerFile} down -v`);
            dockerOthersDown.push(`npm run docker:${dockerConfig}:down`);
          }
        });
        scriptsStorage.set({
          'docker:app:up': `docker-compose -f ${this.DOCKER_DIR}app.yml up -d`,
          'docker:others:await': dockerAwaitScripts.join(' && '),
          'predocker:others:up': dockerBuild.join(' && '),
          'docker:others:up': dockerOthersUp.join(' && '),
          'docker:others:down': dockerOthersDown.join(' && '),
          'ci:e2e:prepare:docker': 'npm run docker:db:up && npm run docker:others:up && docker ps -a',
          'ci:e2e:prepare': 'npm run ci:e2e:prepare:docker',
          'ci:e2e:teardown:docker': 'npm run docker:db:down --if-present && npm run docker:others:down && docker ps -a',
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
      packageJsonE2eScripts() {
        const scriptsStorage = this.packageJson.createStorage('scripts');
        const buildCmd = this.jhipsterConfig.buildTool === GRADLE ? 'gradlew' : 'mvnw';
        if (scriptsStorage.get('e2e')) {
          const applicationWaitTimeout = WAIT_TIMEOUT * (this.applicationTypeGateway ? 2 : 1);
          scriptsStorage.set({
            'ci:server:await': `echo "Waiting for server at port $npm_package_config_backend_port to start" && wait-on -t ${applicationWaitTimeout} http-get://localhost:$npm_package_config_backend_port/management/health && echo "Server at port $npm_package_config_backend_port started"`,
            'pree2e:headless': 'npm run ci:server:await',
            'ci:e2e:run': 'concurrently -k -s first "npm run ci:e2e:server:start" "npm run e2e:headless"',
            'e2e:dev': `concurrently -k -s first "./${buildCmd}" "npm run e2e"`,
            'e2e:devserver': `concurrently -k -s first "npm run backend:start" "npm start" "wait-on -t ${WAIT_TIMEOUT} http-get://localhost:9000 && npm run e2e:headless -- -c baseUrl=http://localhost:9000"`,
          });
        }
      },
    };
  }

  get [POST_WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._postWriting();
  }

  /** @inheritdoc */
  _end() {
    return {
      checkLocaleValue() {
        if (this.languages && this.languages.includes('in')) {
          this.warning(
            "For jdk 17 compatibility 'in' locale value should set 'java.locale.useOldISOCodes=true' environment variable. Refer to https://bugs.openjdk.java.net/browse/JDK-8267069"
          );
        }
      },

      end() {
        this.log(chalk.green.bold('\nServer application generated successfully.\n'));

        let executable = 'mvnw';
        if (this.buildTool === GRADLE) {
          executable = 'gradlew';
        }
        let logMsgComment = '';
        if (os.platform() === 'win32') {
          logMsgComment = ` (${chalk.yellow.bold(executable)} if using Windows Command Prompt)`;
        }
        this.log(chalk.green(`Run your Spring Boot application:\n${chalk.yellow.bold(`./${executable}`)}${logMsgComment}`));
      },
    };
  }

  get [END_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._end();
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
};
