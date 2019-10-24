/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
const debug = require('debug')('jhipster:server');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const writeFiles = require('./files').writeFiles;
const packagejs = require('../../package.json');
const constants = require('../generator-constants');
const statistics = require('../statistics');

const defaultConfig = {
    jhipsterVersion: packagejs.version,
    applicationType: 'monolith',
    serverPort: '8080',
    entitySuffix: '',
    dtoSuffix: 'DTO'
};

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        // eslint-disable-next-line global-require
        require('../interceptor').registerDiff(this);

        debug(`Initializing ${this.rootGeneratorName()}:server generator`);

        this._.defaults(this.storedConfig, defaultConfig);

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });
        // This adds support for a `--[no-]client-hook` flag
        this.option('client-hook', {
            desc: 'Enable Webpack hook from maven/gradle build',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--experimental` flag which can be used to enable experimental features
        this.option('experimental', {
            desc:
                'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
            type: Boolean,
            defaults: false
        });

        this.loadOptions('storage', ['base-name', 'uaa-base-name', 'skip-user-management']);

        // Make constants available in templates
        this._.defaults(this, constants.filter(/^CLIENT_*/, /^SERVER_*/, /^DOCKER_*/));

        this.useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('server', { 'client-hook': !this.skipClient });

        this.registerPrettierTransform();

        // For blueprint, let the original generator call the config.
        // For derivated generator, the main generator already called config.
        // Add option to skip config, use only saved resource.
        if (!this.fromBlueprint && this.isRootGenerator && !this.options.skipConfig) {
            this.composeWithShared(require.resolve('../config'), {
                ...this.options,
                generatorSource: this,
                debug: this.isDebugEnabled
            });
        }
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            loadSharedData() {
                this.loadShared();
            },

            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            displayLogo() {
                this.printJHipsterLogo();
            },

            setupServerconsts() {
                // Make constants available in templates
                this.MAIN_DIR = constants.MAIN_DIR;
                this.TEST_DIR = constants.TEST_DIR;

                this.JAVA_VERSION = constants.JAVA_VERSION;

                this.NODE_VERSION = constants.NODE_VERSION;
                this.YARN_VERSION = constants.YARN_VERSION;
                this.NPM_VERSION = constants.NPM_VERSION;

                this.JIB_VERSION = constants.JIB_VERSION;

                this.KAFKA_VERSION = constants.KAFKA_VERSION;

                this.packagejs = packagejs;
            }
        };
    }

    get initializing() {
        if (this.useBlueprints) return;
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _prompting() {
        return {
            loadSharedData() {
                this.loadShared();
            }
        };
    }

    get prompting() {
        if (this.useBlueprints) return;
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {
            loadSharedData() {
                this.loadShared();
            }
        };
    }

    get configuring() {
        if (this.useBlueprints) return;
        return this._configuring();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            loadSharedData() {
                this.loadShared();
            },

            configure() {
                this.jhiTablePrefix = this.getTableName(this.jhiPrefix);
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
                        enableSwaggerCodegen: this.enableSwaggerCodegen
                    }
                });
            },

            validate() {
                if (this.storedConfig.authenticationType === 'uaa' && _.isNil(this.storedConfig.uaaBaseName)) {
                    this.error('when using --auth uaa, a UAA basename must be provided with --uaa-base-name');
                }
            },

            validateClient() {
                if (!this.clientTheme) {
                    this.clientTheme = this.storedConfig.clientTheme = 'none';
                }
            },

            validateI18n() {
                // If translation is not defined, it is enabled by default
                if (this.enableTranslation === undefined) {
                    this.enableTranslation = true;
                }
                if (this.nativeLanguage === undefined) {
                    this.nativeLanguage = 'en';
                }
                if (this.enableTranslation && this.languages === undefined) {
                    this.languages = ['en', 'fr'];
                }
            },

            configureGlobal() {
                // Make dist dir available in templates
                this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.buildTool);
                this.CLIENT_DIST_DIR = this.getResourceBuildDirectoryForBuildTool(this.configOptions.buildTool) + constants.CLIENT_DIST_DIR;

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
                this.pkType = this.getPkType(this.databaseType);

                this.gatlingTests = this.testFrameworks.includes('gatling');
                this.cucumberTests = this.testFrameworks.includes('cucumber');
            },

            saveConfig() {
                if (!this.isRootGenerator) return;

                if (this.enableTranslation && !this.configOptions.skipI18nQuestion) {
                    this.storedConfig.nativeLanguage = this.nativeLanguage;
                    this.storedConfig.languages = this.languages;
                }
                this.config.set(this.storedConfig);
            }
        };
    }

    get default() {
        if (this.useBlueprints) return;
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return writeFiles();
    }

    get writing() {
        if (this.useBlueprints) return;
        return this._writing();
    }

    _install() {
        return {
            installing() {
                if (this.skipClient) {
                    if (!this.options['skip-install']) {
                        if (this.clientPackageManager === 'yarn') {
                            this.log(chalk.bold(`\nInstalling generator-jhipster@${this.jhipsterVersion} locally using yarn`));
                            this.yarnInstall();
                        } else if (this.clientPackageManager === 'npm') {
                            this.log(chalk.bold(`\nInstalling generator-jhipster@${this.jhipsterVersion} locally using npm`));
                            this.npmInstall();
                        }
                    }
                }
            }
        };
    }

    get install() {
        if (this.useBlueprints) return;
        return this._install();
    }

    // Public API method used by the getter and also by Blueprints
    _end() {
        return {
            end() {
                if (this.prodDatabaseType === 'oracle') {
                    this.log('\n\n');
                    this.warning(
                        `${chalk.yellow.bold(
                            'You have selected Oracle database.\n'
                        )}Please follow our documentation on using Oracle to set up the \nOracle proprietary JDBC driver.`
                    );
                }
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
            }
        };
    }

    get end() {
        if (this.useBlueprints) return;
        return this._end();
    }
};
