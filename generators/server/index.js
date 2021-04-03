/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const _ = require('lodash');
const os = require('os');
const prompts = require('./prompts');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const writeFiles = require('./files').writeFiles;
const packagejs = require('../../package.json');
const constants = require('../generator-constants');
const statistics = require('../statistics');
const { getBase64Secret, getRandomHex } = require('../utils');
const { defaultConfig } = require('../generator-defaults');

let useBlueprints;

module.exports = class JHipsterServerGenerator extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts, { unique: 'namespace' });

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

    useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('server');
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
        this.DOCKER_KEYCLOAK = constants.DOCKER_KEYCLOAK;
        this.DOCKER_KAFKA = constants.DOCKER_KAFKA;
        this.DOCKER_ZOOKEEPER = constants.DOCKER_ZOOKEEPER;
        this.DOCKER_SONAR = constants.DOCKER_SONAR;
        this.DOCKER_CONSUL = constants.DOCKER_CONSUL;
        this.DOCKER_CONSUL_CONFIG_LOADER = constants.DOCKER_CONSUL_CONFIG_LOADER;
        this.DOCKER_SWAGGER_EDITOR = constants.DOCKER_SWAGGER_EDITOR;
        this.DOCKER_PROMETHEUS = constants.DOCKER_PROMETHEUS;
        this.DOCKER_GRAFANA = constants.DOCKER_GRAFANA;
        this.DOCKER_COMPOSE_FORMAT_VERSION = constants.DOCKER_COMPOSE_FORMAT_VERSION;

        this.JAVA_VERSION = constants.JAVA_VERSION;

        this.NODE_VERSION = constants.NODE_VERSION;
        this.NPM_VERSION = constants.NPM_VERSION;
        this.GRADLE_VERSION = constants.GRADLE_VERSION;

        this.JIB_VERSION = constants.JIB_VERSION;
        this.JHIPSTER_DEPENDENCIES_VERSION = constants.JHIPSTER_DEPENDENCIES_VERSION;
        this.SPRING_BOOT_VERSION = constants.SPRING_BOOT_VERSION;
        this.LIQUIBASE_VERSION = constants.LIQUIBASE_VERSION;
        this.LIQUIBASE_DTD_VERSION = constants.LIQUIBASE_DTD_VERSION;
        this.HIBERNATE_VERSION = constants.HIBERNATE_VERSION;
        this.JACOCO_VERSION = constants.JACOCO_VERSION;

        this.KAFKA_VERSION = constants.KAFKA_VERSION;

        this.JACKSON_DATABIND_NULLABLE_VERSION = constants.JACKSON_DATABIND_NULLABLE_VERSION;

        this.ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;

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

  get initializing() {
    if (useBlueprints) return;
    return this._initializing();
  }

  // Public API method used by the getter and also by Blueprints
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

  get prompting() {
    if (useBlueprints) return;
    return this._prompting();
  }

  // Public API method used by the getter and also by Blueprints
  _configuring() {
    return {
      validateConfig() {
        this._validateServerConfiguration();
      },
    };
  }

  get configuring() {
    if (useBlueprints) return;
    return this._configuring();
  }

  // Public API method used by the getter and also by Blueprints
  _composing() {
    return {
      composeCommon() {
        this.composeWithJHipster('common', true);
      },

      composeLanguages() {
        // We don't expose client/server to cli, composing with languages is used for test purposes.
        if (this.jhipsterConfig.enableTranslation === false) return;
        this.composeWithJHipster('languages', true);
      },
    };
  }

  get composing() {
    if (useBlueprints) return;
    return this._composing();
  }

  // Public API method used by the getter and also by Blueprints
  _loading() {
    return {
      loadSharedConfig() {
        this.loadAppConfig();
        this.loadClientConfig();
        this.loadServerConfig();
        this.loadTranslationConfig();
      },
    };
  }

  get loading() {
    if (useBlueprints) return;
    return this._loading();
  }

  // Public API method used by the getter and also by Blueprints
  _preparing() {
    return {
      prepareForTemplates() {
        // Application name modified, using each technology's conventions
        this.frontendAppName = this.getFrontendAppName();
        this.camelizedBaseName = _.camelCase(this.baseName);
        this.dasherizedBaseName = _.kebabCase(this.baseName);
        this.lowercaseBaseName = this.baseName.toLowerCase();
        this.humanizedBaseName = _.startCase(this.baseName);
        this.mainClass = this.getMainClassName();
        this.cacheManagerIsAvailable = ['ehcache', 'caffeine', 'hazelcast', 'infinispan', 'memcached', 'redis'].includes(
          this.cacheProvider
        );
        this.testsNeedCsrf = ['oauth2', 'session'].includes(this.authenticationType);

        this.jhiTablePrefix = this.getTableName(this.jhiPrefix);

        if (this.jhipsterConfig.databaseType === 'sql') {
          // sql
          let dbContainer;
          switch (this.jhipsterConfig.prodDatabaseType) {
            case 'mysql':
              dbContainer = this.DOCKER_MYSQL;
              break;
            case 'mariadb':
              dbContainer = this.DOCKER_MARIADB;
              break;
            case 'postgresql':
              dbContainer = this.DOCKER_POSTGRESQL;
              break;
            case 'mssql':
              dbContainer = this.DOCKER_MSSQL;
              break;
            case 'oracle':
            default:
              dbContainer = null;
          }
          if (dbContainer != null && dbContainer.includes(':')) {
            this.containerVersion = dbContainer.split(':')[1];
          } else {
            this.containerVersion = 'latest';
          }
        }
      },
    };
  }

  get preparing() {
    if (useBlueprints) return;
    return this._preparing();
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return {
      ...super._missingPreDefault(),

      loadUserManagementEntities() {
        if (!this.configOptions.sharedEntities) return;
        // Make user entity available to templates.
        this.user = this.configOptions.sharedEntities.User;
      },

      insight() {
        statistics.sendSubGenEvent('generator', 'server', {
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
          },
        });
      },
    };
  }

  get default() {
    if (useBlueprints) return;
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return { ...writeFiles(), ...super._missingPostWriting() };
  }

  get writing() {
    if (useBlueprints) return;
    return this._writing();
  }

  _postWriting() {
    return {
      packageJsonScripts() {
        const packageJsonConfigStorage = this.packageJson.createStorage('config').createProxy();
        packageJsonConfigStorage.backend_port = this.serverPort;
        packageJsonConfigStorage.packaging = process.env.JHI_WAR === '1' ? 'war' : 'jar';
        if (process.env.JHI_PROFILE) {
          packageJsonConfigStorage.default_environment = process.env.JHI_PROFILE.includes('dev') ? 'dev' : 'prod';
        }
      },
      packageJsonDockerScripts() {
        const scriptsStorage = this.packageJson.createStorage('scripts');
        const databaseType = this.jhipsterConfig.databaseType;
        const dockerAwaitScripts = [];
        if (databaseType === 'sql') {
          const prodDatabaseType = this.jhipsterConfig.prodDatabaseType;
          if (prodDatabaseType === 'no' || prodDatabaseType === 'oracle') {
            scriptsStorage.set('docker:db:up', `echo "Docker for db ${prodDatabaseType} not configured for application ${this.baseName}"`);
          } else {
            scriptsStorage.set({
              'docker:db:up': `docker-compose -f src/main/docker/${prodDatabaseType}.yml up -d`,
              'docker:db:down': `docker-compose -f src/main/docker/${prodDatabaseType}.yml down -v --remove-orphans`,
            });
          }
        } else {
          const dockerFile = `src/main/docker/${databaseType}.yml`;
          if (databaseType === 'cassandra') {
            scriptsStorage.set({
              'docker:db:await': 'wait-on tcp:9042 && sleep 20',
            });
          }
          if (databaseType === 'couchbase' || databaseType === 'cassandra') {
            scriptsStorage.set({
              'docker:db:build': `docker-compose -f ${dockerFile} build`,
              'docker:db:up': `docker-compose -f ${dockerFile} up -d`,
              'docker:db:down': `docker-compose -f ${dockerFile} down -v --remove-orphans`,
            });
          } else if (this.fs.exists(this.destinationPath(dockerFile))) {
            scriptsStorage.set({
              'docker:db:up': `docker-compose -f ${dockerFile} up -d`,
              'docker:db:down': `docker-compose -f ${dockerFile} down -v --remove-orphans`,
            });
          } else {
            scriptsStorage.set('docker:db:up', `echo "Docker for db ${databaseType} not configured for application ${this.baseName}"`);
          }
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
              dockerAwaitScripts.push(
                'echo "Waiting for jhipster-registry to start" && wait-on http-get://localhost:8761/management/health && echo "jhipster-registry started"'
              );
            }

            scriptsStorage.set(`docker:${dockerConfig}:up`, `docker-compose -f ${dockerFile} up -d`);
            dockerOthersUp.push(`npm run docker:${dockerConfig}:up`);
            scriptsStorage.set(`docker:${dockerConfig}:down`, `docker-compose -f ${dockerFile} down -v --remove-orphans`);
            dockerOthersDown.push(`npm run docker:${dockerConfig}:down`);
          }
        });
        scriptsStorage.set({
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
        if (buildTool === 'maven') {
          scriptsStorage.set({
            'backend:info': './mvnw -ntp enforcer:display-info --batch-mode',
            'backend:doc:test': './mvnw -ntp javadoc:javadoc --batch-mode',
            'backend:nohttp:test': './mvnw -ntp checkstyle:check --batch-mode',
            'backend:start': './mvnw -P-webapp',
            'java:jar': './mvnw -ntp verify -DskipTests --batch-mode',
            'java:war': './mvnw -ntp verify -DskipTests --batch-mode -Pwar',
            'java:docker': './mvnw -ntp verify -DskipTests jib:dockerBuild',
            'backend:unit:test': `./mvnw -ntp -P-webapp verify --batch-mode ${javaCommonLog} ${javaTestLog}`,
          });
        } else if (buildTool === 'gradle') {
          const excludeWebapp = this.jhipsterConfig.skipClient ? '' : '-x webapp';
          e2ePackage = 'e2e';
          scriptsStorage.set({
            'backend:info': './gradlew -v',
            'backend:doc:test': `./gradlew javadoc ${excludeWebapp}`,
            'backend:nohttp:test': `./gradlew checkstyleNohttp ${excludeWebapp}`,
            'backend:start': `./gradlew ${excludeWebapp}`,
            'java:jar': './gradlew bootJar -x test -x integrationTest',
            'java:war': './gradlew bootWar -Pwar -x test -x integrationTest',
            'java:docker': './gradlew bootJar jibDockerBuild',
            'backend:unit:test': `./gradlew test integrationTest ${excludeWebapp} ${javaCommonLog} ${javaTestLog}`,
            'postci:e2e:package': 'cp build/libs/*SNAPSHOT.$npm_package_config_packaging e2e.$npm_package_config_packaging',
          });
        }

        scriptsStorage.set({
          'java:jar:dev': 'npm run java:jar -- -Pdev,webapp',
          'java:jar:prod': 'npm run java:jar -- -Pprod',
          'java:war:dev': 'npm run java:war -- -Pdev,webapp',
          'java:war:prod': 'npm run java:war -- -Pprod',
          'java:docker:dev': 'npm run java:docker -- -Pdev,webapp',
          'java:docker:prod': 'npm run java:docker -- -Pprod',
          'ci:backend:test': 'npm run backend:info && npm run backend:doc:test && npm run backend:nohttp:test && npm run backend:unit:test',
          'ci:server:package': 'npm run java:$npm_package_config_packaging:$npm_package_config_default_environment',
          'ci:e2e:package':
            'npm run java:$npm_package_config_packaging:$npm_package_config_default_environment -- -Pe2e -Denforcer.skip=true',
          'preci:e2e:server:start': 'npm run docker:db:await --if-present && npm run docker:others:await --if-present',
          'ci:e2e:server:start': `java -jar ${e2ePackage}.$npm_package_config_packaging --spring.profiles.active=$npm_package_config_default_environment ${javaCommonLog} ${javaTestLog} --logging.level.org.springframework.web=ERROR`,
        });
      },
    };
  }

  get postWriting() {
    if (useBlueprints) return;
    return this._postWriting();
  }

  // Public API method used by the getter and also by Blueprints
  _end() {
    return {
      end() {
        this.log(chalk.green.bold('\nServer application generated successfully.\n'));

        let executable = 'mvnw';
        if (this.buildTool === 'gradle') {
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

  get end() {
    if (useBlueprints) return;
    return this._end();
  }

  _validateServerConfiguration(config = this.jhipsterConfig) {
    if (!config.packageFolder) {
      config.packageFolder = config.packageName.replace(/\./g, '/');
    }

    // JWT authentication is mandatory with Eureka, so the JHipster Registry
    // can control the applications
    if (config.serviceDiscoveryType === 'eureka' && config.authenticationType !== 'oauth2') {
      config.authenticationType = 'jwt';
    }

    // Generate JWT secret key if key does not already exist in config
    if ((config.authenticationType === 'jwt' || config.applicationType === 'microservice') && config.jwtSecretKey === undefined) {
      config.jwtSecretKey = getBase64Secret(null, 64);
    }
    // Generate remember me key if key does not already exist in config
    if (config.authenticationType === 'session' && !config.rememberMeKey) {
      config.rememberMeKey = getRandomHex();
    }

    if (config.authenticationType === 'oauth2') {
      config.skipUserManagement = true;
    }

    if (config.enableHibernateCache && ['no', 'memcached'].includes(config.cacheProvider)) {
      this.info(`Disabling hibernate cache for cache provider ${config.cacheProvider}`);
      config.enableHibernateCache = false;
    }

    // Convert to false for templates.
    if (config.serviceDiscoveryType === 'no' || !config.serviceDiscoveryType) {
      config.serviceDiscoveryType = false;
    }
    if (config.websocket === 'no' || !config.websocket) {
      config.websocket = false;
    }
    if (config.searchEngine === 'no' || !config.searchEngine) {
      config.searchEngine = false;
    }
    if (config.messageBroker === 'no' || !config.messageBroker) {
      config.messageBroker = false;
    }

    if (!config.databaseType && config.prodDatabaseType) {
      config.databaseType = this.getDBTypeFromDBValue(config.prodDatabaseType);
    }
    if (!config.devDatabaseType && config.prodDatabaseType) {
      config.devDatabaseType = config.prodDatabaseType;
    }

    // force variables unused by microservice applications
    if (config.applicationType === 'microservice') {
      config.websocket = false;
    }

    const databaseType = config.databaseType;
    if (databaseType === 'no') {
      config.devDatabaseType = 'no';
      config.prodDatabaseType = 'no';
      config.enableHibernateCache = false;
      config.skipUserManagement = true;
    } else if (['mongodb', 'neo4j', 'couchbase', 'cassandra'].includes(databaseType)) {
      config.devDatabaseType = databaseType;
      config.prodDatabaseType = databaseType;
      config.enableHibernateCache = false;
    }
  }
};
