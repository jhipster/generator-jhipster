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
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const prompts = require('./prompts');
const writeAngularFiles = require('./files-angular').writeFiles;
const writeReactFiles = require('./files-react').writeFiles;
const packagejs = require('../../package.json');
const constants = require('../generator-constants');
const statistics = require('../statistics');
const { clientDefaultConfig, defaultConfig } = require('../generator-defaults');

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;

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
        // This adds support for a `--auth` flag
        this.option('auth', {
            desc: 'Provide authentication type for the application',
            type: String,
        });

        // This adds support for a `--skip-commit-hook` flag
        this.option('skip-commit-hook', {
            desc: 'Skip adding husky commit hooks',
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

        this.experimental = this.configOptions.experimental = this.options.experimental;

        if (this.options.auth) {
            this.jhipsterConfig.authenticationType = this.options.auth;
        }
        if (this.options.skipCommitHook) {
            this.skipCommitHook = this.jhipsterConfig.skipCommitHook = true;
        }

        this.useYarn = this.configOptions.useYarn = this.options.yarn || this.jhipsterConfig.clientPackageManager === 'yarn';
        this.useNpm = this.configOptions.useNpm = !this.options.yarn;
        this.jhipsterConfig.clientPackageManager = this.useYarn ? 'yarn' : 'npm';

        this.existingProject = !!this.jhipsterConfig.clientFramework;

        useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('client');
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

            setupClientconsts() {
                // Make constants available in templates
                this.LOGIN_REGEX = constants.LOGIN_REGEX_JS;
                this.ANGULAR = ANGULAR;
                this.HUSKY_VERSION = constants.HUSKY_VERSION;
                this.LINT_STAGED_VERSION = constants.LINT_STAGED_VERSION;
                this.PRETTIER_VERSION = constants.PRETTIER_VERSION;
                this.PRETTIER_JAVA_VERSION = constants.PRETTIER_JAVA_VERSION;
                this.NODE_VERSION = constants.NODE_VERSION;
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
            askForClient: prompts.askForClient,
            askFori18n: prompts.askForI18n,
            askForClientTheme: prompts.askForClientTheme,
            askForClientThemeVariant: prompts.askForClientThemeVariant,
        };
    }

    get prompting() {
        if (useBlueprints) return;
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {
            configureGlobal() {
                // Make constants available in templates
                this.MAIN_SRC_DIR = this.CLIENT_MAIN_SRC_DIR;
                this.TEST_SRC_DIR = this.CLIENT_TEST_SRC_DIR;
            },

            saveConfig() {
                this.setConfigDefaults(clientDefaultConfig);
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
                if (this.configOptions.skipI18nQuestion) return;

                this.composeLanguagesSub(this, this.configOptions, 'client');
            },

            validateSkipServer() {
                if (
                    this.jhipsterConfig.skipServer &&
                    !(
                        this.jhipsterConfig.databaseType &&
                        this.jhipsterConfig.devDatabaseType &&
                        this.jhipsterConfig.prodDatabaseType &&
                        this.jhipsterConfig.authenticationType
                    )
                ) {
                    this.error(
                        `When using skip-server flag, you must pass a database option and authentication type using ${chalk.yellow(
                            '--db'
                        )} and ${chalk.yellow('--auth')} flags`
                    );
                }
                if (
                    this.jhipsterConfig.skipServer &&
                    this.jhipsterConfig.authenticationType === 'uaa' &&
                    !this.jhipsterConfig.uaaBaseName
                ) {
                    this.error(
                        `When using skip-server flag and UAA as authentication method, you must pass a UAA base name using ${chalk.yellow(
                            '--uaa-base-name'
                        )} flag`
                    );
                }
            },
            getSharedConfigOptions() {
                this.packagejs = packagejs;

                this.setupClientOptions(this);

                const config = _.defaults({}, this.jhipsterConfig, defaultConfig);
                this.clientFramework = config.clientFramework;
                this.clientTheme = config.clientTheme;
                this.clientThemeVariant = config.clientThemeVariant;
                this.enableI18nRTL = false;

                this.baseName = config.baseName;
                this.clientPackageManager = config.clientPackageManager;
                this.applicationType = config.applicationType;
                this.reactive = config.reactive;

                this.serverPort = config.serverPort;
                this.messageBroker = config.messageBroker;
                this.serviceDiscoveryType = config.serviceDiscoveryType;
                this.cacheProvider = config.cacheProvider;
                this.enableHibernateCache = config.enableHibernateCache;
                this.websocket = config.websocket;
                this.databaseType = config.databaseType;
                this.devDatabaseType = config.devDatabaseType;
                this.prodDatabaseType = config.prodDatabaseType;
                this.messageBroker = config.messageBroker;
                this.searchEngine = config.searchEngine;
                this.buildTool = config.buildTool;
                this.authenticationType = config.authenticationType;
                this.otherModules = config.otherModules;
                this.testFrameworks = config.testFrameworks;

                this.protractorTests = this.testFrameworks.includes('protractor');

                this.enableTranslation = config.enableTranslation;
                this.nativeLanguage = config.nativeLanguage;
                this.languages = config.languages;
                if (this.languages !== undefined) {
                    this.enableI18nRTL = this.isI18nRTLSupportNecessary(this.languages);
                }

                this.uaaBaseName = config.uaaBaseName;

                // Make dist dir available in templates
                this.BUILD_DIR = this.getBuildDirectoryForBuildTool(config.buildTool);

                this.styleSheetExt = 'scss';
                this.pkType = this.getPkType(this.databaseType);
                this.apiUaaPath = `${this.authenticationType === 'uaa' ? `services/${this.uaaBaseName.toLowerCase()}/` : ''}`;
                this.DIST_DIR = this.getResourceBuildDirectoryForBuildTool(config.buildTool) + constants.CLIENT_DIST_DIR;

                // Application name modified, using each technology's conventions
                this.camelizedBaseName = _.camelCase(this.baseName);
                this.angularAppName = this.getAngularAppName();
                this.angularXAppName = this.getAngularXAppName();
                this.hipster = this.getHipster(this.baseName);
                this.capitalizedBaseName = _.upperFirst(this.baseName);
                this.dasherizedBaseName = _.kebabCase(this.baseName);
                this.lowercaseBaseName = this.baseName.toLowerCase();
            },

            insight() {
                statistics.sendSubGenEvent('generator', 'client', {
                    app: {
                        clientFramework: this.clientFramework,
                        enableTranslation: this.enableTranslation,
                        nativeLanguage: this.nativeLanguage,
                        languages: this.languages,
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
        return {
            write() {
                if (this.skipClient) return;
                if (this.clientFramework === REACT) {
                    return writeReactFiles.call(this, useBlueprints);
                }
                if (this.clientFramework === ANGULAR) {
                    return writeAngularFiles.call(this, useBlueprints);
                }
            },
        };
    }

    get writing() {
        if (useBlueprints) return;
        return this._writing();
    }

    // Public API method used by the getter and also by Blueprints
    _install() {
        return {
            installing() {
                if (this.skipClient) return;
                const logMsg = `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;

                const installConfig = {
                    bower: false,
                    npm: this.clientPackageManager !== 'yarn',
                    yarn: this.clientPackageManager === 'yarn',
                };

                if (this.options['skip-install']) {
                    this.log(logMsg);
                } else {
                    try {
                        this.installDependencies(installConfig);
                    } catch (e) {
                        this.warning('Install of dependencies failed!');
                        this.log(logMsg);
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
                if (this.skipClient) return;
                this.log(chalk.green.bold('\nClient application generated successfully.\n'));

                const logMsg = `Start your Webpack development server with:\n ${chalk.yellow.bold(`${this.clientPackageManager} start`)}\n`;

                this.log(chalk.green(logMsg));
                if (!this.options['skip-install']) {
                    this.spawnCommandSync(this.clientPackageManager, ['run', 'cleanup']);
                }
            },
        };
    }

    get end() {
        if (useBlueprints) return;
        return this._end();
    }
};
