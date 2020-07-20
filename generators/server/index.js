/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
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

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false,
        });

        // This adds support for a `--experimental` flag which can be used to enable experimental features
        this.option('experimental', {
            desc:
                'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
            type: Boolean,
            defaults: false,
        });

        if (this.options.help) {
            return;
        }

        this.loadOptions();
        this.loadRuntimeOptions();

        // preserve old jhipsterVersion value for cleanup which occurs after new config is written into disk
        this.jhipsterOldVersion = this.jhipsterConfig.jhipsterVersion;

        useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('server');

        this.registerPrettierTransform();
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
                this.LOGIN_REGEX = constants.LOGIN_REGEX;
                this.CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;
                this.SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
                this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
                this.SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
                this.SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;

                this.HUSKY_VERSION = constants.HUSKY_VERSION;
                this.LINT_STAGED_VERSION = constants.LINT_STAGED_VERSION;
                this.PRETTIER_VERSION = constants.PRETTIER_VERSION;
                this.PRETTIER_JAVA_VERSION = constants.PRETTIER_JAVA_VERSION;

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
                this.DOCKER_JHIPSTER_CONSOLE = constants.DOCKER_JHIPSTER_CONSOLE;
                this.DOCKER_JHIPSTER_ELASTICSEARCH = constants.DOCKER_JHIPSTER_ELASTICSEARCH;
                this.DOCKER_JHIPSTER_LOGSTASH = constants.DOCKER_JHIPSTER_LOGSTASH;
                this.DOCKER_TRAEFIK = constants.DOCKER_TRAEFIK;
                this.DOCKER_CONSUL = constants.DOCKER_CONSUL;
                this.DOCKER_CONSUL_CONFIG_LOADER = constants.DOCKER_CONSUL_CONFIG_LOADER;
                this.DOCKER_SWAGGER_EDITOR = constants.DOCKER_SWAGGER_EDITOR;
                this.DOCKER_PROMETHEUS = constants.DOCKER_PROMETHEUS;
                this.DOCKER_GRAFANA = constants.DOCKER_GRAFANA;
                this.DOCKER_COMPOSE_FORMAT_VERSION = constants.DOCKER_COMPOSE_FORMAT_VERSION;

                this.JAVA_VERSION = constants.JAVA_VERSION;

                this.NODE_VERSION = constants.NODE_VERSION;
                this.YARN_VERSION = constants.YARN_VERSION;
                this.NPM_VERSION = constants.NPM_VERSION;
                this.GRADLE_VERSION = constants.GRADLE_VERSION;

                this.JIB_VERSION = constants.JIB_VERSION;
                this.JHIPSTER_DEPENDENCIES_VERSION = constants.JHIPSTER_DEPENDENCIES_VERSION;
                this.SPRING_BOOT_VERSION = constants.SPRING_BOOT_VERSION;
                this.LIQUIBASE_VERSION = constants.LIQUIBASE_VERSION;
                this.LIQUIBASE_DTD_VERSION = constants.LIQUIBASE_DTD_VERSION;
                this.JACOCO_VERSION = constants.JACOCO_VERSION;

                this.KAFKA_VERSION = constants.KAFKA_VERSION;

                this.JACKSON_DATABIND_NULLABLE_VERSION = constants.JACKSON_DATABIND_NULLABLE_VERSION;

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
                        chalk.green(
                            'This is an existing project, using the configuration from your .yo-rc.json file \n' +
                                'to re-generate the project...\n'
                        )
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
                this.CLIENT_DIST_DIR =
                    this.getResourceBuildDirectoryForBuildTool(this.jhipsterConfig.buildTool) + constants.CLIENT_DIST_DIR;
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
    _default() {
        return {
            composeLanguages() {
                // We don't expose client/server to cli, composing with languages is used for test purposes.
                if (this.configOptions.skipComposeLanguages || this.jhipsterConfig.enableTranslation === false) return;

                this.configOptions.skipComposeLanguages = true;
                this.composeWith(require.resolve('../languages'), {
                    ...this.options,
                    configOptions: this.configOptions,
                    debug: this.isDebugEnabled,
                });
            },

            loadSharedConfig() {
                this.loadAppConfig();
                this.loadClientConfig();
                this.loadServerConfig();
                this.loadTranslationConfig();
            },

            setupSharedOptions() {
                // Application name modified, using each technology's conventions
                this.angularAppName = this.getAngularAppName();
                this.camelizedBaseName = _.camelCase(this.baseName);
                this.dasherizedBaseName = _.kebabCase(this.baseName);
                this.lowercaseBaseName = this.baseName.toLowerCase();
                this.humanizedBaseName = _.startCase(this.baseName);
                this.mainClass = this.getMainClassName();
                this.cacheManagerIsAvailable = ['ehcache', 'caffeine', 'hazelcast', 'infinispan', 'memcached', 'redis'].includes(
                    this.cacheProvider
                );
                this.testsNeedCsrf = ['uaa', 'oauth2', 'session'].includes(this.authenticationType);
                this.pkType = this.getPkType(this.databaseType);

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
        return writeFiles();
    }

    get writing() {
        if (useBlueprints) return;
        return this._writing();
    }

    _install() {
        return {
            installing() {
                if (this.skipClient) {
                    if (!this.options.skipInstall) {
                        if (this.clientPackageManager === 'yarn') {
                            this.log(chalk.bold(`\nInstalling generator-jhipster@${this.jhipsterVersion} locally using yarn`));
                            this.yarnInstall();
                        } else if (this.clientPackageManager === 'npm') {
                            this.log(chalk.bold(`\nInstalling generator-jhipster@${this.jhipsterVersion} locally using npm`));
                            this.npmInstall();
                        }
                    }
                }
            },
        };
    }

    get install() {
        if (useBlueprints) return;
        return this._install();
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

        if (config.applicationType === 'uaa') {
            config.authenticationType = 'uaa';
        }

        // JWT authentication is mandatory with Eureka, so the JHipster Registry
        // can control the applications
        if (config.serviceDiscoveryType === 'eureka' && config.authenticationType !== 'uaa' && config.authenticationType !== 'oauth2') {
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

        // user-management will be handled by UAA app, oauth expects users to be managed in IpP
        if ((config.applicationType === 'gateway' && config.authenticationType === 'uaa') || config.authenticationType === 'oauth2') {
            this.info('user-management will be handled by UAA app, oauth expects users to be managed in IpP');
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
        if (config.applicationType === 'microservice' || config.applicationType === 'uaa') {
            config.websocket = false;
        }

        if (config.authenticationType === 'uaa' && !config.uaaBaseName) {
            if (config.applicationType !== 'uaa') {
                this.error('when using uaa authentication type, a UAA basename must be provided');
            }
            config.uaaBaseName = config.baseName;
        }

        const databaseType = config.databaseType;
        if (databaseType === 'no') {
            config.devDatabaseType = 'no';
            config.prodDatabaseType = 'no';
            config.enableHibernateCache = false;
            if (config.authenticationType !== 'uaa') {
                config.skipUserManagement = true;
            }
        } else if (['mongodb', 'neo4j', 'couchbase', 'cassandra'].includes(databaseType)) {
            config.devDatabaseType = databaseType;
            config.prodDatabaseType = databaseType;
            config.enableHibernateCache = false;
        }
    }
};
